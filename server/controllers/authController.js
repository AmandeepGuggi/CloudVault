import mongoose from "mongoose";
import OTP from "../modals/otpModal.js";
import User from "../modals/userModal.js";
import { verifyIdToken } from "../services/googleAuthService.js";
import {sendOtpService} from "../services/sendOtpService.js"
import Directory from "../modals/directoryModal.js";
import Session from "../modals/sessionModal.js";

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

export const loginWithGoogle = async (req, res, next) => {
  // Implementation for Google login
  const { idToken } = req.body;
  const userData = await verifyIdToken(idToken)

  const { email } = userData;

  let user = await User.findOne({ email }).select('-__v -createdAt -updatedAt -authProvider').lean();
  if (user) {
     await Session.deleteMany({ userId: user._id });
    res.clearCookie('sid')

    if(!user.picture.includes("googleusercontent.com")) {
      user.picture = userData.picture;
      // await user.save()
      await User.updateOne({ _id: user._id }, { $set: { picture: userData.picture } })
    }

    const loginSession = await Session.create([{ userId: user._id }])
    const sid = loginSession[0]._id.toString()
  res.cookie('sid', sid, {
    httpOnly: true,
    signed: true,
    sameSite: "lax",
    maxAge: 1000 * 60 * 60 * 24 * 7 ,
  })
    res.status(201).json({ message: 'User Logged In', user })
  }
  const mongooseSession = await mongoose.startSession();

  // Start transaction properly
  mongooseSession.startTransaction();

  try {
    const userRootDirId = new mongoose.Types.ObjectId();
     const userId = new mongoose.Types.ObjectId();
     
    const newUser = await User.insertOne({
      _id: userId,
      fullname: userData.name,
      email: userData.email,
      picture: userData.picture,
      // password,
      authProvider: "google",
      // providerId: null,
      rootDirId: userRootDirId
    }, { mongooseSession })
   await Directory.create([{
      _id: userRootDirId,
      name: `root-${email}`,
      parentDirId: null,
      userId,
      isDirectory: true
    }], { mongooseSession })

    
   
    // await Session.deleteMany({ userId: newUser._id }); 
    // res.clearCookie('sid')
    const loginSession = await Session.create([{ userId: newUser._id }], { mongooseSession })

    console.log(loginSession), loginSession[0]._id.toString();
    const sid = loginSession[0]._id.toString()
  res.cookie('sid', sid, {
    httpOnly: true,
    signed: true,
    sameSite: "lax",
    maxAge: 1000 * 60 * 60 * 24 * 7 ,
  })
   await mongooseSession.commitTransaction();
  console.log("loginSession created", req.signedCookies);
  res.status(201).json({ message: 'User Registered and logged in', sid })
    
  } catch (err) {
    next(err)
  } finally {
    await mongooseSession.endSession();
  }
  // res.json({msg: "Google login endpoint hit", user})
}