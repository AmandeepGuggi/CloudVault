import express from "express";
import { createFile, deleteFile, readFiles, updateFile } from "../controllers/FileController.js";

const router = express.Router();


// CREATE
router.post("/:parentDirId", createFile);
router.post("/", createFile);


// READ
router.get("/:id", readFiles);
// router.get("/", readFiles);

// UPDATE
router.patch("/:id", updateFile);
router.patch("/", updateFile);

// DELETE
router.delete("/:id", deleteFile);

//GET ALL
// router.get("/", (req,res) => {
//     res.send("all files")
// })


export default router;
