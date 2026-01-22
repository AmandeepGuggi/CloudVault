import express from "express";
import { getAllUsers, getDeletedUsers, getUserFiles, hardDeleteUser, logoutSpecificUser, restoreDeletedUser, softDeleteUser } from "../controllers/ownerController.js";


const router = express.Router();

router.post("/users/:id/getUserFiles", getUserFiles)
router.post("/users/getUserFiles", getUserFiles)

router.get("/users/getAllUsers", getAllUsers);


router.post("/users/:id/logout" ,logoutSpecificUser )

router.delete("/users/:id/soft-delete", softDeleteUser)

router.delete("/users/:id/hard-delete", hardDeleteUser)

router.get("/users/getDeletedUsers", getDeletedUsers)

router.post("/users/:id/restore", restoreDeletedUser)



export default router;