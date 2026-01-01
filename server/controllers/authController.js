import OTP from "../modals/otpModal.js";
import {sendOtpService} from "../services/sendOtpService.js"

export const sendOtp = async (req, res) => {
    const { email } = req.body;
    await sendOtpService(email)
    res.json({message: `OTP Sent on ${email}`})
}

export const verifyOtp = async (req, res) => {
    const {email, otp } = req.body;
    const otpRecord = await OTP.findOne({email, otp})
    if(!otpRecord){
        res.status(400).json({error: "Invalid or expired OTP"});
    }
    otpRecord.deleteOne()
    res.json({msg: "otp verified"})
}