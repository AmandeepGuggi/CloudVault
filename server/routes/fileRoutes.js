import express from "express";
import { createFile, deleteFile, readFiles, updateFile } from "../controllers/FileController.js";
import { upload } from "../auth/upload.js";
const router = express.Router();


// CREATE
router.post("/:parentDirId", upload.any(), createFile);
router.post("/",  upload.any(),  createFile);


// READ
router.get("/:id", readFiles);
router.get("/", readFiles);

// UPDATE
router.patch("/:id", updateFile);

// DELETE
router.delete("/:id", deleteFile);

//GET ALL
router.get("/", (req,res) => {
    res.send("all files")
})


export default router;
