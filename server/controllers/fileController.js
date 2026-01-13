import { rm } from "fs/promises";
import path from "path";
import fs from "fs";
import { createWriteStream, readFile } from "fs";
import Directory from "../modals/directoryModal.js";
import { fileTypeFromFile } from "file-type";
import Files from "../modals/fileModal.js";
import mongoose from "mongoose";
import sharp from 'sharp'
import { execFile } from "child_process";
import { promisify } from "util";
const execFileAsync = promisify(execFile);




// export const createFile = async(req, res, next) => {
//   const user = req.user
 
//   let _id = req.params.parentDirId ? req.params.parentDirId : req.user.rootDirId;
//   const parentDirData = await Directory.findOne({ _id });
//   if(!parentDirData){
//     return res.status(404).json({error: "Parent directory does not exists"})
//   }
  
//  const filename = req.headers.filename || "untitled";
//  const extension = path.extname(filename);

//     try {
//       const insertedFile = await Files.insertOne({
//       extension,
//       name: filename,
//       parentDirId:  parentDirData._id,
//       userId: user._id
//     })
//     const fullFileName = `${insertedFile._id.toString()}${extension}`;
//     const writeStream = createWriteStream(`./storage/${fullFileName}`);
//     req.pipe(writeStream);

//       req.on("end", async () => {
//         return res.status(201).json({ message: "File Uploaded" });
//       })

//       req.on("error", async () => {
//         Files.deleteOne({_id: insertedFile._id })
//         return res.status(404).json({ message: "could not upload file" });
//       })

//     } catch (err) {
//       next(err);
//     }

//   }

export const createFile = async (req, res, next) => {
  const user = req.user;
  const _id = req.params.parentDirId ?? req.user.rootDirId;
  const parentDirData = await Directory.findOne({ _id });
  if (!parentDirData) {
    return res.status(404).json({ error: "Parent directory does not exist" });
  }

  const filename = req.headers.filename || "untitled";
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
    // 🔑 COUNT BYTES AS THEY FLOW
    req.on("data", chunk => {
      bytesWritten += chunk.length;
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

  // ONLY images get thumbnails
  if (finalMime.startsWith("image/")) {
    previewPath = `${process.cwd()}/previews/${insertedFile._id}.webp`;
    const thumbnail = await sharp(filePath)
      .resize(300, 300, { fit: "inside" }).jpeg({quality: 80})
      .toFormat("webp")
      .toFile(previewPath);
      console.log("thumbnail", thumbnail);

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
  } else if(finalMime === 'video/mp4'){
    const previewDir = `${process.cwd()}/previews`;
    if (!fs.existsSync(previewDir)) {
    fs.mkdirSync(previewDir, { recursive: true });
  }
    const outBase = `${previewDir}/${insertedFile._id}`;
  const tempPng = `${outBase}.png`;

  // 1️⃣ Extract one frame at 1 second
  await execFileAsync("/opt/homebrew/bin/ffmpeg", [
    "-ss", "00:00:01",
    "-i", filePath,
    "-frames:v", "1",
    "-q:v", "2",
    tempPng
  ]);

   // 2️⃣ Convert to compressed WEBP
  await sharp(tempPng)
    .resize(300, 300, { fit: "inside", withoutEnlargement: true })
    .webp({ quality: 70 })
    .toFile(`${outBase}.webp`);

  // 3️⃣ Cleanup
  fs.unlinkSync(tempPng);

  previewPath = `/previews/${insertedFile._id}.webp`;
  const v = await Files.updateOne(
        { _id: insertedFile._id },
        { $set: { preview: previewPath } }
      );
      console.log(v);
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


export const deleteFilePermanently =  async (req, res, next) => {
  const { id } = req.params;
  const fileData = await Files.findOne({_id: id, userId: req.user._id, isDeleted: true});

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
  console.log({userId});
console.log("res rece");
const file = await Files.findOneAndUpdate(
    { _id: id, userId },
    {
      isDeleted: false,
    },
  );
  console.log({file});

 if (!file) {
    return res.status(404).json({ error: "File not found" });
  }
  const delFile = await Files.findOneAndUpdate(
    { _id: id, userId },
    {
      isDeleted: true,
      deletedAt: new Date()
    },
    { new: true }
  );
console.log({delFile});
 

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

  const file = await Files.findOneAndUpdate(
    { _id: id, userId },
    {
      isDeleted: false,
      deletedAt: null
    },
    { new: true }
  );

  if (!file) {
    return res.status(404).json({ error: "File not found" });
  }

  res.json({ success: true });
};



