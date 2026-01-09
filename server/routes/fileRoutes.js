import express from "express";
import { createFile, deleteFile, getStarredFiles, readFiles, toggleFileStar, updateFile } from "../controllers/fileController.js"


const router = express.Router();


// CREATE
router.post("/:parentDirId", createFile);
router.post("/", createFile);


// READ
router.get('/starred', getStarredFiles );
router.get("/:id", readFiles);
// router.get("/", readFiles);

// UPDATE
router.patch("/:id", updateFile);
router.patch("/", updateFile);

// DELETE
router.delete("/:id", deleteFile);

router.patch('/:id/starred', toggleFileStar );


export default router;
