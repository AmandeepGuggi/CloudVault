import express from "express";
import checkAuth from "../auth/checkUserAuth.js";
import { loginUser, logout, registerUser } from "../controllers/userController.js";


const router = express.Router();

router.post('/register', registerUser)

router.post('/login', loginUser)


router.get('/', checkAuth ,  (req, res) => {
  res.status(200).json({
    name: req.user.fullname,
    email: req.user.email,
    picture: req.user.picture,
    storage:  req.user.storageUsed
  })
})

router.post('/logout', logout)

export default router;
