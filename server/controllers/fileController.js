import { rm } from "fs/promises";
import path from "path";
import { createWriteStream, readFile } from "fs";
import Directory from "../modals/directoryModal.js";
import Files from "../modals/fileModal.js";


export const createFile = async(req, res, next) => {
  const user = req.user
  let _id = req.params.parentDirId ? req.params.parentDirId : req.user.rootDirId;
  const parentDirData = await Directory.findOne({ _id });
  if(!parentDirData){
    return res.status(404).json({error: "Parent directory does not exists"})
  }
  
 const filename = req.headers.filename || "untitled";
 const extension = path.extname(filename);

    try {
      const insertedFile = await Files.insertOne({
      extension,
      name: filename,
      parentDirId:  parentDirData._id,
      userId: user._id
    })
    const fullFileName = `${insertedFile._id.toString()}${extension}`;
    const writeStream = createWriteStream(`./storage/${fullFileName}`);
    req.pipe(writeStream);

      req.on("end", async () => {
        return res.status(201).json({ message: "File Uploaded" });
      })

      req.on("error", async () => {
        Files.deleteOne({_id: insertedFile._id })
        return res.status(404).json({ message: "could not upload file" });
      })

    } catch (err) {
      next(err);
    }

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

// export const updateFile =  async (req, res, next) => {
//   const { id } = req.params;
//   const fileData = await Files.findOne({_id: id, userId: req.user._id})

//   // Check if file exists
//   if (!fileData) {
//     return res.status(404).json({ error: "File not found!" });
//   }

//   // Perform rename
//   try {
//     await Files.updateOne({_id: id, userId: req.user._id}, {$set: {name: req.body.newFilename}})
//     return res.status(200).json({ message: "Renamed" });
//   } catch (err) {
//     err.status = 500;
//     next(err);
//   }
// }
export const updateFile = async (req, res, next) => {
  const { id } = req.params;

  try {
    const result = await Files.updateOne(
      { _id: id, userId: req.user._id },
      { $set: { name: req.body.newFilename } }
    );
    // console.log(result);

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: "File not found or unauthorized!" });
    }

    return res.status(200).json({ message: "Renamed" });
  } catch (err) {
    err.status = 500;
    next(err);
  }
};


export const deleteFile =  async (req, res, next) => {
  const { id } = req.params;
  const fileData = await Files.findOne({_id: id, userId: req.user._id});

  // Check if file exists
  if (!fileData) {
    return res.status(404).json({ error: "File not found!" });
  }

  try {
    // Remove file from /storage
    await rm(`./storage/${id}${fileData.extension}`, { recursive: true });
    await Files.findByIdAndDelete(id)
    return res.status(200).json({ message: "File Deleted Successfully" });
  } catch (err) {
    next(err);
  }
}
