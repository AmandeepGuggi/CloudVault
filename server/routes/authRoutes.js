import express from "express"
const router = express.Router()
import { sendOtp, sendRegisterOtp, verifyOtp, loginWithGoogle } from "../controllers/authController.js";

router.post('/send-otp', sendOtp)

router.post('/send-register-otp', sendRegisterOtp)

router.post('/verify-otp', verifyOtp)

router.post('/google', loginWithGoogle)

export default router;
