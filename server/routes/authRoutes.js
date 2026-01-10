import express from "express"
const router = express.Router()
import { sendOtp, sendRegisterOtp, verifyOtp } from "../controllers/authController.js";

router.post('/send-otp', sendOtp)
router.post('/send-register-otp', sendRegisterOtp)

router.post('/verify-otp', verifyOtp)

export default router;
