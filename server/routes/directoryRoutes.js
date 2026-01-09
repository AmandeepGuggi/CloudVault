import express from "express";

import { createDirectory, deleteFolderPermanently, getBinFolders, getDirectorybyId, getStarredDirectories, moveFolderToBin, renameDirectory, restoreFolder, toggleDirectoryStar } from "../controllers/directoryController.js";


const router = express.Router();

router.get('/starred', getStarredDirectories);
router.get("/bin", getBinFolders);
router.get("/" , getDirectorybyId);
router.get("/:id" , getDirectorybyId);

router.post("/:parentDirId", createDirectory);
router.post("/", createDirectory);

router.patch('/:id', renameDirectory);
router.patch('/', renameDirectory);


router.patch('/:id/starred', toggleDirectoryStar);

// DELETE
router.delete("/:id/permanently", deleteFolderPermanently);
router.patch("/:id/bin", moveFolderToBin);
router.patch("/:id/restore", restoreFolder);

export default router;
