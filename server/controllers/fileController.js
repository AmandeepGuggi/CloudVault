import { rm } from "fs/promises";
import path from "path";
import { createWriteStream, readFile } from "fs";
import Directory from "../modals/directoryModal.js";
import Files from "../modals/fileModal.js";


export const createFile = async (req, res, next) => {
  console.log(req.files);

  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: "No files uploaded" });
  }

  const parentDirId = req.params.parentDirId || req.user.rootDirId;
  const user = req.user;

  const parentDirData = await Directory.findOne({ _id: parentDirId });
  if (!parentDirData) {
    return res.status(404).json({ error: "Parent directory does not exist" });
  }

  try {
    const insertedDocuments = [];

    for (const file of req.files) {
      const { originalname, filename, size, path } = file;
      const extension = originalname.split(".").pop();

      const insertedFile = await Files.insertOne({
        name: originalname,
        extension,
        size,
        parentDirId,
        userId: user._id,
      });

      insertedDocuments.push(insertedFile);
      console.log(insertedDocuments);
    }

    return res.status(201).json({
      message: `${req.files.length} file(s) uploaded`,
      files: insertedDocuments,
    });

  } catch (err) {
    next(err);
  }
};


export const readFiles = async(req, res) => {
  const { id } = req.params;
  const fileData = await Files.findOne({_id: new ObjectId(String(id)) , userId: req.user._id})
  // Check if file exists
  if (!fileData) {
    return res.status(404).json({ error: "Your not found!" });
  }

  // If "download" is requested, set the appropriate headers
  if (req.query.action === "download") {
    res.set("Content-Disposition", `attachment; filename=${fileData.name}`);
  }

  // Send file
  return res.sendFile(`${process.cwd()}/storage/${id}${fileData.extension}`, (err) => {
    if (!res.headersSent && err) {
      return res.status(404).json({ error: "File not f!" });
    }
  });
}

export const updateFile =  async (req, res, next) => {
  const { id } = req.params;
  const fileData = await Files.findOne({_id: new ObjectId(String(id)) , userId: req.user._id})

  // Check if file exists
  if (!fileData) {
    return res.status(404).json({ error: "File not found!" });
  }

  // Perform rename
  try {
    // await writeFile("./filesDB.json", JSON.stringify(filesData));
    await Directory.updateOne({_id: fileData._id , userId: req.user._id}, {$set: {name: req.body.newFilename}})
    return res.status(200).json({ message: "Renamed" });
  } catch (err) {
    err.status = 500;
    next(err);
  }
}

export const deleteFile =  async (req, res, next) => {
  const { id } = req.params;
  const fileData = await Files.findOne({_id: new ObjectId(String(id)) , userId: req.user._id});

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
