import express from "express";

import { createDirectory, deleteDirectory, getDirectorybyId, getStarredDirectories, renameDirectory, toggleDirectoryStar } from "../controllers/directoryController.js";


const router = express.Router();

router.get('/starred', getStarredDirectories);
router.get("/" , getDirectorybyId);
router.get("/:id" , getDirectorybyId);

router.post("/:parentDirId", createDirectory);
router.post("/", createDirectory);

router.patch('/:id', renameDirectory);
router.patch('/', renameDirectory);

router.delete("/:id", deleteDirectory);

router.patch('/:id/starred', toggleDirectoryStar);

export default router;
