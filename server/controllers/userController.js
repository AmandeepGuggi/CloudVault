import mongoose from "mongoose"
import Directory from "../modals/directoryModal.js"
import User from "../modals/userModal.js"
import Session from "../modals/sessionModal.js"
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import OTP from "../modals/otpModal.js";
import { sendOtpService } from "../services/sendOtpService.js";



const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({
  path: path.resolve(__dirname, "../.env"),
  debug: false,
});

export const registerUser = async (req, res, next) => {
  const { fullname, email, password, otp } = req.body
  const foundUser = await User.exists({ email })
  if (foundUser) {
    return res.status(409).json({
      error: "User with this email already exists",
      message: "A user with this email address already exists. Please try logging in or use a different email."
    })
  }
    const otpRecord = await OTP.findOne({email, otp})
    if(!otpRecord){
        res.status(400).json({error: "Invalid or expired OTP"});
    }


  const session = await mongoose.startSession();

  // Start transaction properly
  session.startTransaction();

  try {
    const userRootDirId = new mongoose.Types.ObjectId();
     const userId = new mongoose.Types.ObjectId();
     
    await User.create([{
      _id: userId,
      fullname,
      email,
      password,
      rootDirId: userRootDirId
    }], { session })
   await Directory.create([{
      _id: userRootDirId,
      name: `root-${email}`,
      parentDirId: null,
      userId,
      isDirectory: true
    }], { session })

    res.status(201).json({ message: "User Registered", status: 201 })
    await session.commitTransaction();
    
  } catch (err) {
    if (err.code === 121) {
      console.log(err);
      console.log("err is", err.errorResponse.errInfo.details.schemaRulesNotSatisfied);
      await session.abortTransaction();
      return res.status(400).json({ error: "Validation Error", message: err.errmsg })
    } else {
      next(err)
    }
  } finally {
    await session.endSession();
  }

}

export const loginUser = async (req, res, next) => {
  const { email, password } = req.body
  const foundUser = await User.findOne({ email });
  if (!foundUser) {
    return res.status(409).json({
      error: "Invalid Credentials",
      message: "No user exists with this email account or wrong email/password entered."
    })
  }
 
try{

  const isPasswordValid = await foundUser.comparePassword(password)

  if (!isPasswordValid) {
    return res.status(404).json({ error: 'Invalid Credentials' })
  }

  await sendOtpService(email);
  return res.status(200).json({
      otpRequired: true,
      email,
      message: "OTP sent to registered email",
    });

  const allSession = await Session.find({userId: foundUser.id})
  console.log("allSession:", allSession);
  if(allSession.length >= 2){
    await allSession[0].deleteOne()
  }

  const session = await Session.create({userId: foundUser._id})

  res.cookie('sid', session.id, {
    httpOnly: true,
    signed: true,
    maxAge: 1000 * 60 * 60 * 24 * 7 ,
  })
  res.status(201).json({ message: 'logged in' })
}catch(err){
  console.log("login err is", err);
  res.end()
}
}


export const loginWithOtp = async (req, res) => {
  const { email, otp } = req.body;

  try {
    // 1️⃣ Validate OTP again (never trust frontend flow)
    const otpRecord = await OTP.findOne({ email, otp });
    if (!otpRecord) {
      return res.status(400).json({
        error: "Invalid or expired OTP",
      });
    }

    // 2️⃣ OTP is valid → remove it (one-time means one-time)
    await OTP.deleteOne({ _id: otpRecord._id });

    // 3️⃣ Fetch user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        error: "User not found",
      });
    }

    // 4️⃣ Enforce session limit
    const allSessions = await Session.find({ userId: user._id });
    if (allSessions.length >= 2) {
      await allSessions[0].deleteOne();
    }

    // 5️⃣ Create session
    const session = await Session.create({
      userId: user._id,
    });

    // 6️⃣ Set auth cookie
    res.cookie("sid", session.id, {
      httpOnly: true,
      signed: true,
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    });

    return res.status(200).json({
      message: "Login successful",
    });

  } catch (err) {
    console.error("login-otp error:", err);
    return res.status(500).json({
      error: "OTP login failed",
    });
  }
};



// export const loginUser = async (req, res, next) => {
//   const { email, password } = req.body
//   const foundUser = await User.findOne({ email });
//   console.log(foundUser);
//   if (!foundUser) {
//     return res.status(409).json({
//       error: "Invalid Credentials",
//       message: "No user exists with this email account or wrong email/password entered."
//     })
//   }
 
// try{

//   const isPasswordValid = await foundUser.comparePassword(password)

//   if (!isPasswordValid) {
//     return res.status(404).json({ error: 'Invalid Credentials' })
//   }

//   const allSession = await Session.find({userId: foundUser.id})
//   console.log("allSession:", allSession);
//   if(allSession.length >= 2)
//   {
//     await allSession[0].deleteOne()
//   }

//   const session = await Session.create({userId: foundUser._id})

//   res.cookie('sid', session.id, {
//     httpOnly: true,
//     signed: true,
//     maxAge: 1000 * 60 * 60 * 24 * 7 ,
//   })
//   res.status(201).json({ message: 'logged in' })
// }catch(err){
//   console.log("login err is", err);
//   res.end()
// }
// }

export const logout = async (req, res) => {
  const { sid } = req.signedCookies;
  await Session.findByIdAndDelete(sid)
  res.clearCookie('sid')
  res.status(204).end()
}