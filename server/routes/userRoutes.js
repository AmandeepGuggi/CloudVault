import express from "express";
import checkAuth from "../auth/checkUserAuth.js";
import { loginUser, loginWithOtp, logout, registerUser } from "../controllers/userController.js";

const router = express.Router();

router.post('/register', registerUser)

router.post('/login', loginUser)

router.post("/login-otp", loginWithOtp);

router.post('/', checkAuth, (req, res) => {
  res.status(200).json({
    name: req.user.fullname,
    email: req.user.email,
  })
})

router.post('/logout', logout)

export default router;
