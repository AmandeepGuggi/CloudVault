import express from "express";
import { changeUserRole, getAllUsers, getDeletedUsers, getUserFiles, hardDeleteUser, logoutSpecificUser, restoreDeletedUser, softDeleteUser } from "../controllers/ownerController.js";
import { requirePermissionMiddleware } from "../auth/requirePermissionMiddleware.js";



const router = express.Router();

router.post("/users/:id/getUserFiles",requirePermissionMiddleware("file:view:any"), getUserFiles)
router.post("/users/getUserFiles", requirePermissionMiddleware("file:view:any"), getUserFiles)

router.get("/users/getAllUsers",requirePermissionMiddleware("user:view"), getAllUsers);


router.post("/users/:id/logout", requirePermissionMiddleware("user:update:any"),logoutSpecificUser )

router.delete("/users/:id/soft-delete",requirePermissionMiddleware("user:soft_delete"), softDeleteUser)

router.delete("/users/:id/hard-delete",requirePermissionMiddleware("user:permanent_delete"), hardDeleteUser)

router.get("/users/getDeletedUsers",requirePermissionMiddleware("user:view"), getDeletedUsers)

router.post("/users/:id/restore", requirePermissionMiddleware("user:restore"),
 restoreDeletedUser)

router.patch(
  "/users/:id/role",
  requirePermissionMiddleware("role:assign"),
  changeUserRole
);




export default router;