import express from "express";

import { createDirectory, deleteDirectory, getDirectorybyId, renameDirectory } from "../controllers/directoryController.js";


const router = express.Router();

router.get("/:id" , getDirectorybyId);
router.get("/" , getDirectorybyId);

router.post("/:parentDirId", createDirectory);
router.post("/", createDirectory);

router.patch('/:id', renameDirectory);

router.delete("/:id", deleteDirectory);


export default router;
