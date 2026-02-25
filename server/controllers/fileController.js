import { rm, mkdtemp, mkdir, copyFile } from "fs/promises";
import path from "path";
import fs from "fs";
import crypto from "node:crypto";
import { createWriteStream, readFile } from "fs";
import Directory from "../models/directoryModal.js";
import { fileTypeFromFile } from "file-type";
import Files from "../models/fileModal.js";
import mongoose from "mongoose";
import sharp from 'sharp'
import { execFile } from "child_process";
import { promisify } from "util";
import User from "../models/userModal.js";
import { pipeline } from "stream/promises";
import ShareLink from "../models/ShareLink.js";
import FileShare from "../models/FileShare.js";
import os from "os";
import { sendShareInviteService } from "../services/sendShareInviteService.js";
import {
  applySizeDeltaForFiles,
  applySizeDeltaToAncestorChain,
  collectDirectoryTreeIds,
  ensureDirectorySizesInitialized,
  getTopLevelDirectories,
} from "../services/directorySizeService.js";

const execFileAsync = promisify(execFile);

const sanitizeFilename = (name = "file") =>
  name.replace(/[<>:"/\\|?*\x00-\x1F]/g, "_").trim() || "file";

async function collectNestedDirectoryIds(rootDirectoryIds, userId) {
  const allIds = new Set(rootDirectoryIds.map((id) => id.toString()));
  let frontier = [...rootDirectoryIds];

  while (frontier.length > 0) {
    const children = await Directory.find({
      userId,
      isDeleted: false,
      parentDirId: { $in: frontier },
    }).select("_id").lean();

    const nextFrontier = [];
    for (const child of children) {
      const id = child._id.toString();
      if (!allIds.has(id)) {
        allIds.add(id);
        nextFrontier.push(child._id);
      }
    }

    frontier = nextFrontier;
  }

  return [...allIds].map((id) => new mongoose.Types.ObjectId(id));
}

async function collectFilesForSelection({ userId, fileIds = [], directoryIds = [] }) {
  const validFileIds = fileIds.filter((id) => mongoose.Types.ObjectId.isValid(id));
  const validDirIds = directoryIds.filter((id) => mongoose.Types.ObjectId.isValid(id));

  const fileObjectIds = validFileIds.map((id) => new mongoose.Types.ObjectId(id));
  const dirObjectIds = validDirIds.map((id) => new mongoose.Types.ObjectId(id));

  let nestedDirIds = [];
  if (dirObjectIds.length) {
    const ownedRoots = await Directory.find({
      _id: { $in: dirObjectIds },
      userId,
      isDeleted: false,
    }).select("_id").lean();

    nestedDirIds = await collectNestedDirectoryIds(
      ownedRoots.map((d) => d._id),
      userId
    );
  }

  const query = {
    userId,
    isDeleted: false,
    $or: [],
  };

  if (fileObjectIds.length) {
    query.$or.push({ _id: { $in: fileObjectIds } });
  }
  if (nestedDirIds.length) {
    query.$or.push({ parentDirId: { $in: nestedDirIds } });
  }

  if (query.$or.length === 0) return [];

  return Files.find(query)
    .select("_id name extension parentDirId")
    .lean();
}

export const createFile = async (req, res, next) => {
  const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;
  const user = req.user;
  const _id = req.params.parentDirId ?? req.user.rootDirId;
  const parentDirData = await Directory.findOne({ _id });
  if (!parentDirData) {
    return res.status(404).json({ error: "Parent directory does not exist" });
  }
  await ensureDirectorySizesInitialized(user._id);

  const rawFilename = req.headers["x-filename"];
  let filename = "untitled";
  if (typeof rawFilename === "string" && rawFilename.trim()) {
    try {
      filename = decodeURIComponent(rawFilename);
    } catch {
      filename = rawFilename;
    }
  }

  const fileSize = Number.parseInt(req.headers["x-filesize"], 10);
  if (Number.isNaN(fileSize)) {
    return res.status(400).json({ error: "Missing or invalid file size" });
  }
  if (fileSize > MAX_FILE_SIZE_BYTES) {
    return res.status(413).json({ error: "File size cannot be more than 5MB" });
  }

  const extension = path.extname(filename);

  let bytesWritten = 0;

  try {
    const insertedFile = await Files.insertOne({
      extension,
      name: filename,
      parentDirId: parentDirData._id,
      userId: user._id,
      size: 0, // temporary
      // mimeType: null
    });

    const fullFileName = `${insertedFile._id}${extension}`;
    const filePath = `${process.cwd()}/storage/${insertedFile._id}${extension}`;
    const writeStream = createWriteStream(`./storage/${fullFileName}`);
    req.on("data", (chunk) => {
      bytesWritten += chunk.length;
    });
    req.on("aborted", () => {
  console.log("Upload aborted");
});
    
    req.pipe(writeStream);
    
    writeStream.on("finish", async () => {
      const detected = await fileTypeFromFile(filePath);
      const finalMime =
      detected?.mime || "application/octet-stream";
       await Files.updateOne(
        { _id: insertedFile._id },
        { $set: { size: bytesWritten, mimeType: finalMime } }
      );
      let previewPath = null;

      await User.updateOne(
    { _id: user._id },
    { $inc: { storageUsed: bytesWritten } }
  );
  await applySizeDeltaToAncestorChain({
    directoryId: parentDirData._id,
    delta: bytesWritten,
    includeSelf: true,
    userId: user._id,
  });

  // ONLY images get thumbnails
  if (finalMime.startsWith("image/")) {
    previewPath = `${process.cwd()}/previews/${insertedFile._id}.webp`;
    const thumbnail = await sharp(filePath)
      .resize(300, 300, { fit: "inside" }).jpeg({quality: 80})
      .toFormat("webp")
      .toFile(previewPath);

      previewPath = `/previews/${insertedFile._id}.webp`
       await Files.updateOne(
        { _id: insertedFile._id },
        { $set: { preview: previewPath } }
      );
  } else if (finalMime === 'application/pdf') {
  const previewDir = `${process.cwd()}/previews`;
  if (!fs.existsSync(previewDir)) {
    fs.mkdirSync(previewDir, { recursive: true });
  }

  const outBase = `${previewDir}/${insertedFile._id}`;

  // 1️⃣ PDF → PNG (first page only)
  await execFileAsync("/opt/homebrew/bin/pdftocairo", [
    "-f", "1",
    "-l", "1",
    "-singlefile",
    "-png",
    filePath,
    outBase
  ]);

  // 2️⃣ Resize → WEBP thumbnail
  await sharp(`${outBase}.png`)
    .resize(300, 300, { fit: "inside", withoutEnlargement: true })
    .toFormat("webp")
    .toFile(`${outBase}.webp`);

  // 3️⃣ Cleanup PNG
  fs.unlinkSync(`${outBase}.png`);

  previewPath = `/previews/${insertedFile._id}.webp`;
   await Files.updateOne(
        { _id: insertedFile._id },
        { $set: { preview: previewPath } }
      );
  } else if(finalMime === 'video/mp4' || finalMime === 'video/quicktime' ){
    const previewDir = `${process.cwd()}/previews`;
    if (!fs.existsSync(previewDir)) {
    fs.mkdirSync(previewDir, { recursive: true });
  }
    const outBase = `${previewDir}/${insertedFile._id}`;
  const tempPng = `${outBase}.png`;

  await execFileAsync("ffmpeg", [
  "-i", filePath,
  "-ss", "00:00:00.5",
  "-frames:v", "1",
  "-vf", "scale=iw:-1,format=yuv420p",
  "-pix_fmt", "yuv420p",
  tempPng
]);

   // 2️⃣ Convert to compressed WEBP
  await sharp(tempPng)
    .resize(300, 300, { fit: "inside", withoutEnlargement: true })
    .webp({ quality: 80 })
    .toFile(`${outBase}.webp`);

  // 3️⃣ Cleanup
  fs.unlinkSync(tempPng);

  previewPath = `/previews/${insertedFile._id}.webp`;
  const v = await Files.updateOne(
        { _id: insertedFile._id },
        { $set: { preview: previewPath } }
      );
  }

     

      res.status(201).json({ message: "File uploaded", size: bytesWritten });
    });

    writeStream.on("error", async () => {
      await Files.deleteOne({ _id: insertedFile._id });
      res.status(500).json({ error: "File write failed" });
    });

  } catch (err) {
    next(err);
  }
};

export const driveFiles = async (req, res) => {
   const { files, accessToken, dirId } = req.body;
  const _id = dirId ? dirId : req.user.rootDirId;
  const parentDirData = await Directory.findOne({ _id });
  if (!parentDirData) {
    return res.status(404).json({ error: "Parent directory does not exist" });
  }
  try {
   
    const userId = req.user?._id; // or however you store session user
 
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (!accessToken || !files?.length) {
      return res.status(400).json({ error: "Missing data" });
    }
    await ensureDirectorySizesInitialized(userId);

    for (const file of files) {
      await importSingleFile(file, accessToken, userId, parentDirData);
    }

    res.json({ message: "Imported successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Drive import failed", err });
  }
}

export const bulkMoveToBin = async (req, res) => {
  const userId = req.user._id;
  const { fileIds = [], directoryIds = [] } = req.body || {};
  const now = new Date();
  await ensureDirectorySizesInitialized(userId);

  const validFileIds = fileIds.filter((id) => mongoose.Types.ObjectId.isValid(id));
  const validDirIds = directoryIds.filter((id) => mongoose.Types.ObjectId.isValid(id));

  const fileObjectIds = validFileIds.map((id) => new mongoose.Types.ObjectId(id));

  const topLevelDirectories = await getTopLevelDirectories({
    directoryIds: validDirIds,
    userId,
    isDeleted: false,
  });
  const coveredDirectoryIds = await collectDirectoryTreeIds({
    rootDirectoryIds: topLevelDirectories.map((dir) => dir._id),
    userId,
    isDeleted: false,
  });
  const coveredSet = new Set(coveredDirectoryIds.map((id) => id.toString()));

  const explicitFiles = fileObjectIds.length
    ? await Files.find({
        _id: { $in: fileObjectIds },
        userId,
        isDeleted: false,
      }).select("_id size parentDirId").lean()
    : [];
  const effectiveExplicitFiles = explicitFiles.filter(
    (file) => !coveredSet.has(file.parentDirId?.toString())
  );

  await applySizeDeltaForFiles({
    files: effectiveExplicitFiles,
    sign: -1,
    userId,
  });
  for (const directory of topLevelDirectories) {
    await applySizeDeltaToAncestorChain({
      directoryId: directory._id,
      delta: -Number(directory.totalSize || 0),
      includeSelf: false,
      userId,
    });
  }

  const [fileUpdate, dirUpdate] = await Promise.all([
    fileObjectIds.length
      ? Files.updateMany(
          { _id: { $in: fileObjectIds }, userId, isDeleted: false },
          { $set: { isDeleted: true, deletedAt: now } }
        )
      : Promise.resolve({ modifiedCount: 0 }),
    validDirIds.length
      ? Directory.updateMany(
          { _id: { $in: validDirIds }, userId, isDeleted: false },
          { $set: { isDeleted: true, deletedAt: now } }
        )
      : Promise.resolve({ modifiedCount: 0 }),
  ]);

  return res.json({
    message: "Bulk move to bin completed",
    filesMoved: fileUpdate.modifiedCount || 0,
    foldersMoved: dirUpdate.modifiedCount || 0,
  });
};

export const bulkDownloadLinks = async (req, res) => {
  const userId = req.user._id;
  const { fileIds = [], directoryIds = [] } = req.body || {};

  const selectedFiles = await collectFilesForSelection({ userId, fileIds, directoryIds });
  if (!selectedFiles.length) {
    return res.status(404).json({ error: "No downloadable files found." });
  }

  const baseUrl = `${req.protocol}://${req.get("host")}`;
  const links = selectedFiles.map((file) => ({
    id: file._id.toString(),
    name: file.name,
    url: `${baseUrl}/file/${file._id.toString()}?action=download`,
  }));

  return res.json({ links, count: links.length });
};

export const bulkDownloadZip = async (req, res) => {
  const userId = req.user._id;
  const { fileIds = [], directoryIds = [] } = req.body || {};

  const selectedFiles = await collectFilesForSelection({ userId, fileIds, directoryIds });
  if (!selectedFiles.length) {
    return res.status(404).json({ error: "No downloadable files found." });
  }

  const tmpRoot = await mkdtemp(path.join(os.tmpdir(), "cloudvault-zip-"));
  const stagingDir = path.join(tmpRoot, "files");
  const zipPath = path.join(tmpRoot, "download.zip");

  try {
    await mkdir(stagingDir, { recursive: true });

    const usedNames = new Set();
    for (const file of selectedFiles) {
      const src = path.join(process.cwd(), "storage", `${file._id.toString()}${file.extension}`);
      if (!fs.existsSync(src)) continue;

      const ext = path.extname(file.name || "") || file.extension || "";
      const baseName = sanitizeFilename(path.basename(file.name || `file-${file._id.toString()}`, ext));
      let candidate = `${baseName}${ext}`;
      let counter = 1;
      while (usedNames.has(candidate)) {
        candidate = `${baseName} (${counter})${ext}`;
        counter += 1;
      }
      usedNames.add(candidate);

      const dest = path.join(stagingDir, candidate);
      await copyFile(src, dest);
    }

    await execFileAsync("zip", ["-rq", zipPath, "."], { cwd: stagingDir });

    return res.download(zipPath, `cloudvault-download-${Date.now()}.zip`, async () => {
      await rm(tmpRoot, { recursive: true, force: true });
    });
  } catch (error) {
    await rm(tmpRoot, { recursive: true, force: true });
    return res.status(500).json({
      error: "Failed to create zip download",
      details: error?.message || "Unknown error",
    });
  }
};

export const bulkRestoreFromBin = async (req, res) => {
  const userId = req.user._id;
  const { fileIds = [], directoryIds = [] } = req.body || {};
  await ensureDirectorySizesInitialized(userId);

  const validFileIds = fileIds.filter((id) => mongoose.Types.ObjectId.isValid(id));
  const validDirIds = directoryIds.filter((id) => mongoose.Types.ObjectId.isValid(id));

  const fileObjectIds = validFileIds.map((id) => new mongoose.Types.ObjectId(id));

  const topLevelDirectories = await getTopLevelDirectories({
    directoryIds: validDirIds,
    userId,
    isDeleted: true,
  });
  const coveredDirectoryIds = await collectDirectoryTreeIds({
    rootDirectoryIds: topLevelDirectories.map((dir) => dir._id),
    userId,
    isDeleted: true,
  });
  const coveredSet = new Set(coveredDirectoryIds.map((id) => id.toString()));

  const explicitFiles = fileObjectIds.length
    ? await Files.find({
        _id: { $in: fileObjectIds },
        userId,
        isDeleted: true,
      }).select("_id size parentDirId").lean()
    : [];
  const effectiveExplicitFiles = explicitFiles.filter(
    (file) => !coveredSet.has(file.parentDirId?.toString())
  );

  await applySizeDeltaForFiles({
    files: effectiveExplicitFiles,
    sign: 1,
    userId,
  });
  for (const directory of topLevelDirectories) {
    await applySizeDeltaToAncestorChain({
      directoryId: directory._id,
      delta: Number(directory.totalSize || 0),
      includeSelf: false,
      userId,
    });
  }

  const [fileUpdate, dirUpdate] = await Promise.all([
    fileObjectIds.length
      ? Files.updateMany(
          { _id: { $in: fileObjectIds }, userId, isDeleted: true },
          { $set: { isDeleted: false, deletedAt: null } }
        )
      : Promise.resolve({ modifiedCount: 0 }),
    validDirIds.length
      ? Directory.updateMany(
          { _id: { $in: validDirIds }, userId, isDeleted: true },
          { $set: { isDeleted: false, deletedAt: null } }
        )
      : Promise.resolve({ modifiedCount: 0 }),
  ]);

  return res.json({
    message: "Bulk restore completed",
    filesRestored: fileUpdate.modifiedCount || 0,
    foldersRestored: dirUpdate.modifiedCount || 0,
  });
};

export const bulkDeleteForeverFromBin = async (req, res) => {
  const userId = req.user._id;
  const { fileIds = [], directoryIds = [] } = req.body || {};
  await ensureDirectorySizesInitialized(userId);

  const validFileIds = fileIds.filter((id) => mongoose.Types.ObjectId.isValid(id));
  const validDirIds = directoryIds.filter((id) => mongoose.Types.ObjectId.isValid(id));

  const fileObjectIds = validFileIds.map((id) => new mongoose.Types.ObjectId(id));
  const dirObjectIds = validDirIds.map((id) => new mongoose.Types.ObjectId(id));

  const ownedRootDirs = dirObjectIds.length
    ? await Directory.find({
        _id: { $in: dirObjectIds },
        userId,
        isDeleted: true,
      }).select("_id").lean()
    : [];

  const treeIds = ownedRootDirs.length
    ? await collectDirectoryTreeIds({
        rootDirectoryIds: ownedRootDirs.map((d) => d._id),
        userId,
      })
    : [];

  const filesFromDirs = treeIds.length
    ? await Files.find({
        userId,
        parentDirId: { $in: treeIds },
      }).select("_id extension size").lean()
    : [];

  const explicitFiles = fileObjectIds.length
    ? await Files.find({
        _id: { $in: fileObjectIds },
        userId,
        isDeleted: true,
      }).select("_id extension size").lean()
    : [];

  const filesMap = new Map();
  for (const file of [...filesFromDirs, ...explicitFiles]) {
    filesMap.set(file._id.toString(), file);
  }
  const filesToDelete = [...filesMap.values()];

  let storageToDecrement = 0;
  for (const file of filesToDelete) {
    storageToDecrement += Number(file.size || 0);
  }

  await Promise.all(
    filesToDelete.map(async (file) => {
      const filePath = path.join(process.cwd(), "storage", `${file._id.toString()}${file.extension}`);
      try {
        await rm(filePath);
      } catch {
        // ignore missing files
      }
    })
  );

  if (filesToDelete.length) {
    await Files.deleteMany({
      _id: { $in: filesToDelete.map((f) => f._id) },
      userId,
    });
  }

  if (treeIds.length) {
    await Directory.deleteMany({
      _id: { $in: treeIds },
      userId,
    });
  }

  if (storageToDecrement > 0) {
    await User.updateOne(
      { _id: userId },
      { $inc: { storageUsed: -storageToDecrement } }
    );
  }

  return res.json({
    message: "Bulk permanent delete completed",
    filesDeleted: filesToDelete.length,
    foldersDeleted: treeIds.length,
  });
};

export const bulkUnstarItems = async (req, res) => {
  const userId = req.user._id;
  const { fileIds = [], directoryIds = [] } = req.body || {};

  const validFileIds = fileIds.filter((id) => mongoose.Types.ObjectId.isValid(id));
  const validDirIds = directoryIds.filter((id) => mongoose.Types.ObjectId.isValid(id));

  const fileObjectIds = validFileIds.map((id) => new mongoose.Types.ObjectId(id));
  const dirObjectIds = validDirIds.map((id) => new mongoose.Types.ObjectId(id));

  const [fileUpdate, dirUpdate] = await Promise.all([
    fileObjectIds.length
      ? Files.updateMany(
          { _id: { $in: fileObjectIds }, userId, isDeleted: false, isStarred: true },
          { $set: { isStarred: false } }
        )
      : Promise.resolve({ modifiedCount: 0 }),
    dirObjectIds.length
      ? Directory.updateMany(
          { _id: { $in: dirObjectIds }, userId, isDeleted: false, isStarred: true },
          { $set: { isStarred: false } }
        )
      : Promise.resolve({ modifiedCount: 0 }),
  ]);

  return res.json({
    message: "Bulk unstar completed",
    filesUnstarred: fileUpdate.modifiedCount || 0,
    foldersUnstarred: dirUpdate.modifiedCount || 0,
  });
};

async function importSingleFile(file, accessToken, userId, parentDirData) {
  // 1️⃣ Fetch metadata again (never trust frontend fully)
  const metaRes = await fetch(
    `https://www.googleapis.com/drive/v3/files/${file.id}?fields=name,mimeType,size`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!metaRes.ok) {
    throw new Error("Failed to fetch Drive metadata");
  }

  const meta = await metaRes.json();

  // ❌ Reject Google Docs for MVP
  if (meta.mimeType.startsWith("application/vnd.google-apps")) {
    throw new Error("Google Docs export not supported yet");
  }

  // 2️⃣ Download file stream
  const downloadRes = await fetch(
    `https://www.googleapis.com/drive/v3/files/${file.id}?alt=media`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );
  if (!downloadRes.ok) {
    throw new Error("Failed to download Drive file");
  }
  const extension = path.extname(meta.name)

  const fileSize = Number(meta.size || 0);
  const insertedFile = await Files.insertOne({
      extension,
      name: meta.name,
      parentDirId: parentDirData._id,
      userId,
      size: fileSize,
      mimeType: meta.mimeType,
    });
        const filePath = `${process.cwd()}/storage/${insertedFile._id}${extension}`;
        const fullFileName = `${insertedFile._id}${extension}`;
      let previewPath = null;
    
  await pipeline(downloadRes.body, fs.createWriteStream(filePath));

   if (meta.mimeType.startsWith("image/")) {
    previewPath = `${process.cwd()}/previews/${insertedFile._id}.webp`;
    const thumbnail = await sharp(filePath)
      .resize(300, 300, { fit: "inside" }).jpeg({quality: 80})
      .toFormat("webp")
      .toFile(previewPath);

      previewPath = `/previews/${insertedFile._id}.webp`
       await Files.updateOne(
        { _id: insertedFile._id },
        { $set: { preview: previewPath } }
      );
  } else if (meta.mimeType === 'application/pdf') {
     const previewDir = `${process.cwd()}/previews`;
  if (!fs.existsSync(previewDir)) {
    fs.mkdirSync(previewDir, { recursive: true });
  }

  const outBase = `${previewDir}/${insertedFile._id}`;

  // 1️⃣ PDF → PNG (first page only)
  await execFileAsync("/opt/homebrew/bin/pdftocairo", [
    "-f", "1",
    "-l", "1",
    "-singlefile",
    "-png",
    filePath,
    outBase
  ]);

  // 2️⃣ Resize → WEBP thumbnail
  await sharp(`${outBase}.png`)
    .resize(300, 300, { fit: "inside", withoutEnlargement: true })
    .toFormat("webp")
    .toFile(`${outBase}.webp`);

  // 3️⃣ Cleanup PNG
  fs.unlinkSync(`${outBase}.png`);

  previewPath = `/previews/${insertedFile._id}.webp`;
   await Files.updateOne(
        { _id: insertedFile._id },
        { $set: { preview: previewPath } }
      );
  } else if(meta.mimeType === 'video/mp4' || meta.mimeType === 'video/quicktime' ){
    const previewDir = `${process.cwd()}/previews`;
    if (!fs.existsSync(previewDir)) {
    fs.mkdirSync(previewDir, { recursive: true });
  }
    const outBase = `${previewDir}/${insertedFile._id}`;
  const tempPng = `${outBase}.png`;

  await execFileAsync("ffmpeg", [
  "-i", filePath,
  "-ss", "00:00:00.5",
  "-frames:v", "1",
  "-vf", "scale=iw:-1,format=yuv420p",
  "-pix_fmt", "yuv420p",
  tempPng
]);

   // 2️⃣ Convert to compressed WEBP
  await sharp(tempPng)
    .resize(300, 300, { fit: "inside", withoutEnlargement: true })
    .webp({ quality: 80 })
    .toFile(`${outBase}.webp`);

  // 3️⃣ Cleanup
  fs.unlinkSync(tempPng);

  previewPath = `/previews/${insertedFile._id}.webp`;
  const v = await Files.updateOne(
        { _id: insertedFile._id },
        { $set: { preview: previewPath } }
      );
  }

  await applySizeDeltaToAncestorChain({
    directoryId: parentDirData._id,
    delta: fileSize,
    includeSelf: true,
    userId,
  });
  await User.updateOne(
    { _id: userId },
    { $inc: { storageUsed: fileSize } })

  // 4️⃣ Insert DB record (example)
  await saveFileToDB({
    userId,
    name: meta.name,
    mimeType: meta.mimeType,
    size: meta.size,
    path: filePath,
    source: "google-drive",
  });
}

async function saveFileToDB(file) {
  // Replace with your existing file insert logic
  console.log("Saved:", file);
}


export const readFiles = async(req, res) => {
  const { id } = req.params;
  const fileData = await Files.findOne({_id: id , userId: req.user._id})
  if (!fileData) {
    return res.status(404).json({ error: "No such file exists!" });
  }
   const filePath = `${process.cwd()}/storage/${id}${fileData.extension}`;

  if (req.query.action === "download") {
    res.set("Content-Disposition", `attachment; filename=${fileData.name}`);
  }

  // Send file
  return res.sendFile(filePath, (err) => {
    if (!res.headersSent && err) {
      return res.status(404).json({ error: err });
    }
  });
}



export const previewFile = async (req, res) => {
  const { id } = req.params
  const fileData = await File.findOne({_id: id});

  if (!fileData) return res.status(404).json({ error: "No such file exists!" });

  const filePath = path.join("storage", `${fileData._id}${fileData.extension}`);
  
  if (!fs.existsSync(diskPath)) {
    return res.sendStatus(410); // gone
  }

  res.setHeader("Content-Type", fileData.mimeType);
  res.setHeader("Content-Disposition", "inline");

  fs.createReadStream(filePath).pipe(res);
};


export const updateFile = async (req, res, next) => {
  const { id } = req.params;

  try {
    const result = await Files.updateOne(
      { _id: id, userId: req.user._id },
      { $set: { name: req.body.newFilename } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: "File not found or unauthorized!" });
    }

    return res.status(200).json({ message: "Renamed" });
  } catch (err) {
    err.status = 500;
    next(err);
  }
};


export const deleteFilePermanently =  async (req, res, next) => {
  const { id } = req.params;
  await ensureDirectorySizesInitialized(req.user._id);
  const fileData = await Files.findOne({_id: id, userId: req.user._id, isDeleted: true});
  if (!fileData) {
    return res.status(404).json({ error: "File not found!" });
  }

 await User.updateOne(
  { _id: req.user._id },
  { $inc: { storageUsed: -fileData.size } }
);

  try {
    // Remove file from /storage
    await rm(`./storage/${id}${fileData.extension}`);
    await Files.findByIdAndDelete(id)
    return res.status(200).json({ message: "File Deleted Successfully" });
  } catch (err) {
    next(err);
  }
}




export const toggleFileStar = async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: "Invalid file id" });
  }

  const file = await Files.findOne({ _id: id, userId, isDeleted: false });

  if (!file) {
    return res.status(404).json({ error: "File not found" });
  }

  file.isStarred = !file.isStarred;
  await file.save();

  res.json({
    id: file._id,
    isStarred: file.isStarred,
  });
};

export const getStarredFiles = async (req, res) => {
  const userId = req.user._id;
  const files = await Files.find({
    userId,
    isStarred: true,
    isDeleted: false,
  }).sort({ updatedAt: -1 });
  res.json(files);
};


export const moveFileToBin = async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;
  await ensureDirectorySizesInitialized(userId);
  const file = await Files.findOne({
    _id: id,
    userId,
    isDeleted: false,
  }).select("_id size parentDirId");

  if (!file) {
    return res.status(404).json({ error: "File not found" });
  }

  await applySizeDeltaToAncestorChain({
    directoryId: file.parentDirId,
    delta: -Number(file.size || 0),
    includeSelf: true,
    userId,
  });
  await Files.findOneAndUpdate(
    { _id: id, userId },
    {
      isDeleted: true,
      deletedAt: new Date()
    },
    { new: true }
  );
 
  res.json({ success: true });
};

export const getBinFiles = async (req, res) => {
  const userId = req.user._id;

  const files = await Files.find({
    userId,
    isDeleted: true
  }).sort({ deletedAt: -1 });

  res.json(files);
};

export const restoreFile = async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;
  await ensureDirectorySizesInitialized(userId);

  const existingFile = await Files.findOne({
    _id: id,
    userId,
    isDeleted: true,
  }).select("_id size parentDirId");
  if (!existingFile) {
    return res.status(404).json({ error: "File not found" });
  }
  await applySizeDeltaToAncestorChain({
    directoryId: existingFile.parentDirId,
    delta: Number(existingFile.size || 0),
    includeSelf: true,
    userId,
  });

  const file = await Files.findOneAndUpdate(
    { _id: id, userId },
    {
      isDeleted: false,
      deletedAt: null
    },
    { new: true }
  );

  res.json({ success: true });
};

export const getExistingLink = async (req, res) => {
  const userId = req.user._id;
  const { fileId } = req.params;
  const file = await Files.findOne({ _id: fileId, userId, isDeleted: false }).select("_id");
  if (!file) {
    return res.status(404).json({ error: "File does not exist" });
  }

  const existingLink = await ShareLink.findOne({ fileId, revoked: false });
  if (!existingLink) {
    return res.status(404).json({ error: "Share link does not exist" });
  }

  return res.json({
    shareUrl: `${process.env.SERVER_BASE_URL}/file/s/${existingLink.token}`,
  });
};

export const createShareLink = async (req, res) => {
  const userId = req.user._id;
  const { fileId } = req.params;
  const permission = req.body?.permission || "view";
  const file = await Files.findById(fileId);
  const existingLink = await ShareLink.findOne({ fileId, revoked: false });


if (!file) {
  return res.status(404).json({ error: "File does not exist" });
}

if (file.userId.toString() !== userId.toString() ) {
  return res.status(404).json({ error: "only owner can create link" });
}

 if(existingLink){
  return res.json({
  shareUrl: `${process.env.SERVER_BASE_URL}/file/s/${existingLink.token}` });
 }

const token = crypto.randomUUID();

await ShareLink.create({
  fileId,
  token,
  permission,
  expiresAt: null,
  revoked: false,
  createdBy: userId
});
res.json({
  shareUrl: `${process.env.SERVER_BASE_URL}/file/s/${token}`
});
}

export const validateShareEmail = async (req, res) => {
  const email = String(req.body?.email || "").trim().toLowerCase();
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: "Invalid email" });
  }

  const user = await User.findOne({ email, isDeleted: false })
    .select("_id email fullname picture")
    .lean();
  return res.json({ exists: Boolean(user), user: user || null });
};

async function ensureShareLinkForFile(fileId, ownerId) {
  let link = await ShareLink.findOne({ fileId, revoked: false });
  if (link) return link;

  const token = crypto.randomUUID();
  link = await ShareLink.create({
    fileId,
    token,
    permission: "view",
    expiresAt: null,
    revoked: false,
    createdBy: ownerId,
  });
  return link;
}

export const inviteFileRecipient = async (req, res) => {
  const ownerId = req.user._id;
  const { fileId } = req.params;
  const permission = req.body?.permission || "viewer";
  const email = String(req.body?.email || "").trim().toLowerCase();
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: "Invalid email" });
  }

  if (!["viewer", "commenter", "editor"].includes(permission)) {
    return res.status(400).json({ error: "Invalid permission" });
  }

  const file = await Files.findOne({ _id: fileId, userId: ownerId, isDeleted: false }).select("_id name");
  if (!file) {
    return res.status(404).json({ error: "File not found or unauthorized" });
  }

  const ownerEmail = String(req.user?.email || "").toLowerCase();
  if (ownerEmail && ownerEmail === email) {
    return res.status(400).json({ error: "You cannot share with your own email" });
  }

  const recipient = await User.findOne({ email, isDeleted: false }).select("_id email fullname").lean();
  if (recipient?._id?.toString() === ownerId.toString()) {
    return res.status(400).json({ error: "You cannot share with your own email" });
  }

  const inviteToken = crypto.randomUUID();

  const shareRecord = await FileShare.findOneAndUpdate(
    { fileId, recipientEmail: email },
    {
      $set: {
        ownerId,
        recipientUserId: recipient?._id || null,
        permission,
        status: recipient ? "accepted" : "pending",
        token: inviteToken,
      },
    },
    { upsert: true, new: true }
  );

  const shareLink = await ensureShareLinkForFile(fileId.toString(), ownerId);
  const inviteUrl = `${process.env.SERVER_BASE_URL}/file/s/${shareLink.token}`;

  try {
    await sendShareInviteService({
      to: email,
      ownerName: req.user.fullname || "A user",
      fileName: file.name,
      permission,
      inviteUrl,
    });
  } catch (error) {
    return res.status(500).json({ error: "Failed to send invite email" });
  }

  return res.json({
    message: "Invite sent",
    share: {
      id: shareRecord._id,
      recipientEmail: shareRecord.recipientEmail,
      recipientUserId: shareRecord.recipientUserId,
      permission: shareRecord.permission,
      status: shareRecord.status,
    },
    recipientExists: Boolean(recipient),
  });
};

export const getFileRecipients = async (req, res) => {
  const ownerId = req.user._id;
  const { fileId } = req.params;

  const file = await Files.findOne({ _id: fileId, userId: ownerId, isDeleted: false }).select("_id");
  if (!file) {
    return res.status(404).json({ error: "File not found or unauthorized" });
  }

  const recipients = await FileShare.find({ fileId, ownerId })
    .populate("recipientUserId", "fullname email picture")
    .select("_id recipientEmail recipientUserId permission status updatedAt")
    .sort({ updatedAt: -1 })
    .lean();

  const normalized = recipients.map((recipient) => ({
    _id: recipient._id,
    recipientEmail: recipient.recipientEmail,
    permission: recipient.permission,
    status: recipient.status,
    updatedAt: recipient.updatedAt,
    recipientUser: recipient.recipientUserId
      ? {
          _id: recipient.recipientUserId._id,
          fullname: recipient.recipientUserId.fullname,
          email: recipient.recipientUserId.email,
          picture: recipient.recipientUserId.picture,
        }
      : null,
  }));

  return res.json({ recipients: normalized });
};

export const revokeFileRecipient = async (req, res) => {
  const ownerId = req.user._id;
  const { fileId, recipientId } = req.params;

  const file = await Files.findOne({ _id: fileId, userId: ownerId, isDeleted: false }).select("_id");
  if (!file) {
    return res.status(404).json({ error: "File not found or unauthorized" });
  }

  const result = await FileShare.deleteOne({ _id: recipientId, fileId, ownerId });
  if (result.deletedCount === 0) {
    return res.status(404).json({ error: "Recipient not found" });
  }

  return res.json({ message: "Recipient removed" });
};

export const acceptFileInvite = async (req, res) => {
  const { token } = req.params;
  const invite = await FileShare.findOne({ token });
  if (!invite) {
    return res.status(404).json({ error: "Invite not found" });
  }

  const userEmail = String(req.user?.email || "").toLowerCase();
  if (!userEmail) {
    return res.status(401).json({ error: "Not logged in" });
  }
  if (userEmail !== invite.recipientEmail) {
    return res.status(403).json({ error: "Invite is not for this user" });
  }

  invite.recipientUserId = req.user._id;

  invite.status = "accepted";
  await invite.save();
  return res.json({ message: "Invite accepted" });
};

export const getSharedFile = async (req, res) => {
  const { token } = req.params;
  const link = await ShareLink.findOne({ token });

  if (!link || link.revoked) {
    return res.status(403).json({ error: "access revoked or does not exist" });
  }
  if (link.expiresAt && link.expiresAt < Date.now()) {
    return res.status(403).json({ error: "link has expired" });
  }

  const fileData = await Files.findOne({ _id: link.fileId, isDeleted: false });
  if (!fileData) {
    return res.status(404).json({ error: "File not found" });
  }

  const isOwner = fileData.userId.toString() === req.user._id.toString();
  if (!isOwner) {
    const allowedRecipient = await FileShare.findOne({
      fileId: fileData._id,
      recipientEmail: String(req.user.email || "").toLowerCase(),
      status: "accepted",
    }).select("_id");

    if (!allowedRecipient) {
      return res.status(403).json({ error: "You do not have access to this file" });
    }
  }

  const filePath = `${process.cwd()}/storage/${fileData._id.toString()}${fileData.extension}`;
  res.setHeader("Content-Type", fileData.mimeType);
  res.setHeader("Content-Disposition", "inline");

  fs.createReadStream(filePath).pipe(res);
};

export const deleteLink = async (req, res) => {
  const userId = req.user._id;
  const { fileId } = req.params
  const file = await Files.findById(fileId);
  if (!file) {
    return res.status(404).json({ error: "File does not exist" });
  }
  if (file.userId.toString() !== userId.toString()) {
    return res.status(403).json({ error: "only owner can revoke link" });
  }

  await ShareLink.findOneAndDelete({ fileId });
  return res.json({message: "access deleted"})
}
