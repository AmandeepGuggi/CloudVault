import mongoose from "mongoose";
import Directory from "../models/directoryModal.js";
import Files from "../models/fileModal.js";

const initializedUsers = new Set();

function toObjectId(id) {
  if (!id) return null;
  return typeof id === "string" ? new mongoose.Types.ObjectId(id) : id;
}

export async function recalculateDirectorySizesForUser(userId) {
  const queryUserId = toObjectId(userId);
  const directories = await Directory.find({ userId: queryUserId })
    .select("_id parentDirId")
    .lean();

  if (!directories.length) return;

  const parentById = new Map();
  const totals = new Map();

  for (const directory of directories) {
    const key = directory._id.toString();
    parentById.set(key, directory.parentDirId ? directory.parentDirId.toString() : null);
    totals.set(key, 0);
  }

  const groupedFiles = await Files.aggregate([
    { $match: { userId: queryUserId, isDeleted: false } },
    { $group: { _id: "$parentDirId", size: { $sum: "$size" } } },
  ]);

  for (const group of groupedFiles) {
    const size = Number(group.size || 0);
    if (!size) continue;
    let currentId = group._id ? group._id.toString() : null;
    while (currentId && totals.has(currentId)) {
      totals.set(currentId, totals.get(currentId) + size);
      currentId = parentById.get(currentId) || null;
    }
  }

  const ops = [];
  for (const [directoryId, totalSize] of totals.entries()) {
    ops.push({
      updateOne: {
        filter: { _id: new mongoose.Types.ObjectId(directoryId), userId: queryUserId },
        update: { $set: { totalSize: Math.max(0, totalSize) } },
      },
    });
  }

  if (ops.length) {
    await Directory.bulkWrite(ops);
  }
}

export async function ensureDirectorySizesInitialized(userId) {
  const key = String(userId);
  if (initializedUsers.has(key)) return;

  const missing = await Directory.exists({
    userId: toObjectId(userId),
    $or: [{ totalSize: { $exists: false } }, { totalSize: null }],
  });

  if (missing) {
    await recalculateDirectorySizesForUser(userId);
  }

  initializedUsers.add(key);
}

export async function getAncestorDirectoryIds(directoryId, { includeSelf = true, userId } = {}) {
  const ancestorIds = [];
  let cursor = toObjectId(directoryId);

  while (cursor) {
    const query = { _id: cursor };
    if (userId) query.userId = toObjectId(userId);
    const current = await Directory.findOne(query).select("_id parentDirId").lean();
    if (!current) break;
    ancestorIds.push(current._id);
    cursor = current.parentDirId || null;
  }

  if (!includeSelf) {
    ancestorIds.shift();
  }

  return ancestorIds;
}

export async function applySizeDeltaToAncestorChain({
  directoryId,
  delta,
  includeSelf = true,
  userId,
}) {
  const safeDelta = Number(delta || 0);
  if (!directoryId || safeDelta === 0) return;

  const ancestorIds = await getAncestorDirectoryIds(directoryId, { includeSelf, userId });
  if (!ancestorIds.length) return;

  const query = { _id: { $in: ancestorIds } };
  if (userId) query.userId = toObjectId(userId);
  await Directory.updateMany(query, { $inc: { totalSize: safeDelta } });
}

export async function applySizeDeltaForFiles({ files, sign = 1, userId }) {
  if (!Array.isArray(files) || files.length === 0) return;

  const groupedByParent = new Map();
  for (const file of files) {
    const parentId = file.parentDirId?.toString();
    if (!parentId) continue;
    const fileSize = Number(file.size || 0);
    if (!fileSize) continue;
    groupedByParent.set(parentId, (groupedByParent.get(parentId) || 0) + fileSize);
  }

  for (const [parentId, groupedSize] of groupedByParent.entries()) {
    await applySizeDeltaToAncestorChain({
      directoryId: parentId,
      delta: sign * groupedSize,
      includeSelf: true,
      userId,
    });
  }
}

export async function collectDirectoryTreeIds({
  rootDirectoryIds,
  userId,
  isDeleted,
}) {
  const rootIds = (rootDirectoryIds || [])
    .map((id) => (mongoose.Types.ObjectId.isValid(id) ? toObjectId(id) : null))
    .filter(Boolean);
  if (!rootIds.length) return [];

  const baseQuery = { userId: toObjectId(userId), _id: { $in: rootIds } };
  if (typeof isDeleted === "boolean") baseQuery.isDeleted = isDeleted;

  const ownedRoots = await Directory.find(baseQuery).select("_id").lean();
  if (!ownedRoots.length) return [];

  const allIds = new Set(ownedRoots.map((entry) => entry._id.toString()));
  let frontier = ownedRoots.map((entry) => entry._id);

  while (frontier.length > 0) {
    const query = {
      userId: toObjectId(userId),
      parentDirId: { $in: frontier },
    };
    if (typeof isDeleted === "boolean") query.isDeleted = isDeleted;

    const children = await Directory.find(query).select("_id").lean();
    const next = [];
    for (const child of children) {
      const id = child._id.toString();
      if (!allIds.has(id)) {
        allIds.add(id);
        next.push(child._id);
      }
    }
    frontier = next;
  }

  return [...allIds].map((id) => new mongoose.Types.ObjectId(id));
}

export async function getTopLevelDirectories({
  directoryIds,
  userId,
  isDeleted,
}) {
  const ids = (directoryIds || [])
    .map((id) => (mongoose.Types.ObjectId.isValid(id) ? toObjectId(id) : null))
    .filter(Boolean);
  if (!ids.length) return [];

  const query = { _id: { $in: ids }, userId: toObjectId(userId) };
  if (typeof isDeleted === "boolean") query.isDeleted = isDeleted;

  const selected = await Directory.find(query).select("_id parentDirId totalSize").lean();
  if (selected.length <= 1) return selected;

  const selectedSet = new Set(selected.map((entry) => entry._id.toString()));
  const parentCache = new Map(selected.map((entry) => [entry._id.toString(), entry.parentDirId]));

  async function getParentId(id) {
    if (parentCache.has(id)) return parentCache.get(id);
    const dir = await Directory.findById(id).select("parentDirId").lean();
    const parentId = dir?.parentDirId || null;
    parentCache.set(id, parentId);
    return parentId;
  }

  const roots = [];
  for (const directory of selected) {
    let parentId = directory.parentDirId;
    let covered = false;
    while (parentId) {
      const parentKey = parentId.toString();
      if (selectedSet.has(parentKey)) {
        covered = true;
        break;
      }
      parentId = await getParentId(parentKey);
    }
    if (!covered) roots.push(directory);
  }

  return roots;
}
