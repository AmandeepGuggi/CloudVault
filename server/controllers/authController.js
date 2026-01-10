import OTP from "../modals/otpModal.js";
import User from "../modals/userModal.js";
import {sendOtpService} from "../services/sendOtpService.js"

export const sendOtp = async (req, res) => {
    const { email } = req.body;
    await sendOtpService(email)
    res.json({message: `OTP Sent on ${email}`})
}
export const sendRegisterOtp = async (req, res) => {
    const { email } = req.body;
      const userExists = await User.exists({ email });
      console.log("does user exist", userExists);
  if (userExists) {
    return res.status(409).json({ error: "User already exists" });
  }
    await sendOtpService(email)
    res.json({message: `OTP Sent on ${email}`})
}

export const verifyOtp = async (req, res) => {
    const {email, otp } = req.body;
    const otpRecord = await OTP.findOne({email, otp})
    if(!otpRecord){
       return res.status(400).json({error: "Invalid or expired OTP"});
    }
    // otpRecord.deleteOne()
   const updatedOtp = await OTP.updateOne(
    { email },
    { $set: { verified: true } }
  );
  console.log("object", updatedOtp);
    res.json({msg: "otp verified"})
}

