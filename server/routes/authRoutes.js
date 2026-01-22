import express from "express"
const router = express.Router()
import { sendOtp, sendRegisterOtp, verifyOtp, loginWithGoogle, githubCallback, notification, notificationSeen, logoutDevice } from "../controllers/authController.js";
import { getLoggedInDevices } from "../controllers/sessionController.js";
import checkAuth from "../auth/checkUserAuth.js";

router.post('/send-otp', sendOtp)

router.post('/send-register-otp', sendRegisterOtp)

router.post('/verify-otp', verifyOtp)

router.post('/google', loginWithGoogle)

router.get('/github/callback', githubCallback)

router.get('/devices',checkAuth, getLoggedInDevices)

router.get('/notifications',checkAuth, notification)

router.post("/notifications/seen", checkAuth, notificationSeen);

router.delete('/logout-device/:sessionId', checkAuth, logoutDevice)


export default router;
