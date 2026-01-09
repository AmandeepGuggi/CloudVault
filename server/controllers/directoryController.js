import Directory from "../modals/directoryModal.js"
import Files from "../modals/fileModal.js";
import { rm, writeFile } from "fs/promises";
import mongoose from "mongoose";


export const getDirectorybyId = async (req, res) => {
  const user = req.user;
  const id = req.params.id || user.rootDirId.toString()
  const doesExist = await Directory.exists({_id: id})
if (!doesExist) {
    return res.status(404).json({ error: "Directory not found or you do not have access to it!" });
  }
  const directoryData = await Directory.findOne({_id: id}).lean();

  const files = await Files.find({parentDirId: id }).select("name userId parentDirId size updatedAt isStarred isDeleted").lean()
  const directories = await Directory.find({ parentDirId: id }).select("name userId parentDirId isDirectory isStarred isDeleted").lean()
  
  return res.status(200).json({ ...directoryData, files: files.map((file) => ({...file, id: file._id})), directories: directories.map((dir) => ({...dir, id: dir._id}) ) })
}

export const createDirectory = async (req, res, next) => {
  const user = req.user
  let parentDirId = req.params.parentDirId || user.rootDirId;
  // parentDirId = new ObjectId(String(parentDirId));
  const dirname = req.headers.dirname || 'New Folder'
  const parentDirData = await Directory.findOne({ _id: parentDirId});
  if (!parentDirData) {
    return res.status(404).json({ message: "Parent Directory not found!" });
  }
  try {
    await Directory.create({
    name: dirname,
    parentDirId,
    userId: user._id,
    isDirectory: true,
  })
    return res.status(200).json({ message: "Directory Created!" })
  } catch (err) {
    next(err)
  }
}

export const renameDirectory = async (req, res, next) => {
  const user = req.user;
  const { id } = req.params;
  const { newDirName } = req.body;

  try {
    await Directory.findOneAndUpdate({_id: id, userId: user._id },{$set:  { name: newDirName }})
    res.status(200).json({ message: "Directory Renamed!" });
  } catch (err) {
      if(err.code === 121) {
      return res.status(400).json({error: "directory validation Error", message: err.errmsg})
    } else{
      next(err)
    }
  }
}

export const deleteDirectory = async (req, res, next) => {
  const user = req.user;
  const id = req.params.id;

  async function getAllSubfolderIds(dirId) {
  const subfolders = await Directory.find({ parentDirId: dirId}).lean()
  let ids = [dirId];

  for (const sub of subfolders) {
    const subIds = await getAllSubfolderIds(sub._id);
    ids = ids.concat(subIds);
  }
  return ids;
}

 async function deleteFolderRecursively(folderId) {
  const allIds = await getAllSubfolderIds(folderId);
  await Directory.deleteMany({ _id: { $in: allIds } });
  const fileData = await Files.find({ parentDirId: { $in: allIds }}, { projection: {_id: 1, extension: 1}}).lean()
  for (const f of fileData){
    await rm(`./storage/${f._id.toString()}${f.extension}`)
  }
  await Files.deleteMany({ parentDirId: { $in: allIds } });
}

  try {
    deleteFolderRecursively(id)
    res.status(200).json({msg: "folder deleted"})
  } catch (err) {
    next(err);
  }
}

export const toggleDirectoryStar = async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: "Invalid directory id" });
  }

  const dir = await Directory.findOne({ _id: id, userId, isDeleted: false });

  if (!dir) {
    return res.status(404).json({ error: "Directory not found" });
  }

  dir.isStarred = !dir.isStarred;
  await dir.save();

  res.json({
    id: dir._id,
    isStarred: dir.isStarred,
  });
};



export const getStarredDirectories = async (req, res) => {
  const userId = req.user

  const dirs = await Directory.find({
    userId,
    isStarred: true,
    isDeleted: false,
  }).sort({ updatedAt: -1 });
  res.json(dirs);
};
