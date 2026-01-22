import Directory from "../modals/directoryModal.js";
import Files from "../modals/fileModal.js"
import Session from "../modals/sessionModal.js"
import User from "../modals/userModal.js"
import { rm } from "fs/promises";
import path from "path";
import mongoose from "mongoose";



export const getAllUsers = async (req, res) => {
  const allUsers = await User.find({isDeleted: false}).lean()
  const allSessions = await Session.find().lean()
  const allSessionsId = allSessions.map(({userId})=> userId.toString() )
  const allSessionsUserIdSet = new Set(allSessionsId)

  const transformedUsers = allUsers.map(({_id, fullname, email, role, picture, storageUsed}) => ({
    id: _id,
    name: fullname,
    email,
    avatar: picture,
    isLoggedIn: allSessionsUserIdSet.has(_id.toString()),
    role,
    storage: storageUsed
  }))
  res.status(200).json(transformedUsers)
}

export const getUserFiles = async (req, res) => {
  const { userId } = req.body
  const user = await User.findOne({_id: userId})
  const id = req.params.id || user.rootDirId.toString()
  const doesExist = await Directory.exists({_id: id})

if (!doesExist) {
    return res.status(404).json({ error: "Directory not found !" });
  }

  const files = await Files.find({parentDirId: id }).select("name -_id parentDirId size updatedAt extension").lean()
  const directories = await Directory.find({ parentDirId: id }).select("name  _id parentDirId isDirectory  isDeleted").lean()
  
  return res.status(200).json({ files: files.map((file) => ({...file, id: file._id})), directories: directories.map((dir) => ({...dir, id: dir._id}) ) })
}

export const logoutSpecificUser = async (req, res) => {
    const {id} = req.params
     if(req.user._id.toString()=== id){
      return res.status(403).json({error: "you cannot delete yourself"})
    }
   try{
  await Session.deleteMany({ userId: id });
  res.status(204).end();
   }catch(err){
    console.log(err);
   }
}

export const softDeleteUser = async (req, res) => {
    const {id} = req.params
    const {deleteReason} = req.body;
  
    if(req.user._id.toString()=== id){
      return res.status(403).json({error: "you cannot delete yourself"})
    }

  try{
    await User.updateOne({ _id: id },
  { $set: { isDeleted: true, deletedReason: deleteReason, deletedAt: Date.now(), deletedBy: req.user.role } })
    await Session.deleteMany({ userId: id });
  res.status(204).end();
  }catch(err){
    console.log("error deleting specific user", err);
    res.json({err: "error deleting user"})
  }
}
export const hardDeleteUser = async (req, res) => {
    const {id} = req.params
    if(req.user._id.toString()=== id){
      return res.status(403).json({error: "you cannot delete yourself"})
    }
     const session = await mongoose.startSession();
    
      // Start transaction properly
      session.startTransaction();

    const files = await Files.find({ userId: id });
      for (const file of files) {
          const filePath = path.join(
          process.cwd(),
          "storage",
          `${file._id}${file.extension}`
           );

          try {
            await rm(filePath, { force: true }, {session});
            } catch (err) {
            console.error("Failed to remove file:", filePath, err);
            }
          }
    const previews = await Files.find({ userId: id });
      for (const file of previews) {
          const previewPath = path.join(
          process.cwd(), `${file.preview}` );

          try {
            await rm(previewPath, { force: true }, {session});
            } catch (err) {
            console.error("Failed to remove preview:", previewPath, err);
            }
          }
    await User.deleteOne({_id: id}, {session})
    await Directory.deleteMany({ userId: id }, {session})
    await Session.deleteMany({ userId: id }, {session})
    await Files.deleteMany({ userId: id }, { session })

     await session.commitTransaction();
     res.status(204).end();
      await session.endSession();
  
}

export const getDeletedUsers = async (req, res) => {
  const allUsers = await User.find({isDeleted: true}).lean()
  const allSessions = await Session.find().lean()
  const allSessionsId = allSessions.map(({userId})=> userId.toString() )
  const allSessionsUserIdSet = new Set(allSessionsId)

  const transformedUsers = allUsers.map(({_id, fullname, email, role, deletedBy, deletedAt, deletedReason}) => ({
    id: _id,
    name: fullname,
    email,
    role,
    deletedBy, deletedAt, reason: deletedReason
  }))
  res.status(200).json(transformedUsers)
}

export const restoreDeletedUser = async (req, res) => {
    const {id} = req.params
  try{
    await User.updateOne({ _id: id },
  { $set: { isDeleted: false, deletedReason: "", deletedAt: null, deletedBy: ""} })
  res.status(204).end();
  }catch(err){
    console.log("restoring specific user", err);
    res.json({err: "error restoring user"})
  }
}