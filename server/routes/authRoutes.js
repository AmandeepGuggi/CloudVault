import express from "express"
const router = express.Router()
import { sendOtp, sendRegisterOtp, verifyOtp, loginWithGoogle, githubCallback } from "../controllers/authController.js";

router.post('/send-otp', sendOtp)

router.post('/send-register-otp', sendRegisterOtp)

router.post('/verify-otp', verifyOtp)

router.post('/google', loginWithGoogle)

router.get('/github/callback', githubCallback)

export default router;
