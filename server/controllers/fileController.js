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
import User from "../modals/userModal.js";
import { pipeline } from "stream/promises";

const execFileAsync = promisify(execFile);



export const createFile = async (req, res, next) => {
  const user = req.user;
  const _id = req.params.parentDirId ?? req.user.rootDirId;
  const parentDirData = await Directory.findOne({ _id });
  if (!parentDirData) {
    return res.status(404).json({ error: "Parent directory does not exist" });
  }

  // const filename = req.headers.filename || "untitled";
  const filename = decodeURIComponent(req.headers["x-filename"]) || "untitled";
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

      await User.updateOne(
    { _id: user._id },
    { $inc: { storageUsed: bytesWritten } }
  );

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
  const _id = req.params.parentDirId ?? req.user.rootDirId;
  const parentDirData = await Directory.findOne({ _id });
  if (!parentDirData) {
    return res.status(404).json({ error: "Parent directory does not exist" });
  }
  try {
    const { files, accessToken } = req.body;
    const userId = req.user?._id; // or however you store session user
 
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (!accessToken || !files?.length) {
      return res.status(400).json({ error: "Missing data" });
    }

    for (const file of files) {
      await importSingleFile(file, accessToken, userId, parentDirData);
    }

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Drive import failed", err });
  }
}

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
  console.log("meta", meta);

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
  console.log("bodyres", downloadRes);
  const extension = path.extname(meta.name)

   const insertedFile = await Files.insertOne({
      extension,
      name: meta.name,
      parentDirId: parentDirData._id,
      userId,
      size: meta.size,
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

       await User.updateOne(
    { _id: userId },
    { $inc: { storageUsed: meta.size } })

    // const writeStream = createWriteStream(`./storage/${fullFileName}`);
    //  req.pipe(writeStream);





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
  const fileData = await Files.findOne({_id: id, userId: req.user._id, isDeleted: true});

 await User.updateOne(
  { _id: req.user._id },
  { $inc: { storageUsed: -fileData.size } }
);

  // Check if file exists
  if (!fileData) {
    return res.status(404).json({ error: "File not found!" });
  }

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
const file = await Files.findOneAndUpdate(
    { _id: id, userId },
    {
      isDeleted: false,
    },
  );

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
