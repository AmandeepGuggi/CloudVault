import express from "express";
import { createFile, deleteFilePermanently, driveFiles, getBinFiles, getStarredFiles, moveFileToBin, readFiles, restoreFile, toggleFileStar, updateFile } from "../controllers/fileController.js"


const router = express.Router();


// CREATE
router.post("/:parentDirId", createFile);
router.post("/", createFile);

router.post("/drive/import", driveFiles)

// READ
router.get('/starred', getStarredFiles );
router.get("/bin", getBinFiles);
router.get("/:id", readFiles);
// router.get("/", readFiles);

// UPDATE
router.patch("/:id", updateFile);
router.patch("/", updateFile);


router.patch('/:id/starred', toggleFileStar );


// DELETE
router.delete("/:id/permanently", deleteFilePermanently);
router.patch("/:id/bin", moveFileToBin);
router.patch("/:id/restore", restoreFile);


export default router;
