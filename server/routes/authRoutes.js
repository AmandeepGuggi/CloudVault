import express from "express"
const router = express.Router()
import { sendOtp, verifyOtp } from "../controllers/authController.js";

router.post('/send-otp', sendOtp)

router.post('/verify-otp', verifyOtp)

export default router;
