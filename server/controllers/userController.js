import mongoose from "mongoose"
import Directory from "../modals/directoryModal.js"
import User from "../modals/userModal.js"
import Session from "../modals/sessionModal.js"
import OTP from "../modals/otpModal.js";


export const registerUser = async (req, res, next) => {
  const { fullname, email, password } = req.body
  console.log("formata received", fullname, email, password );
   const otpRecord = await OTP.findOne({ email, verified: true });
   if (!otpRecord) {
    return res.status(401).json({ error: "OTP not verified" });
  }

  const foundUser = await User.exists({ email })
  console.log("hii", {foundUser});
  if (foundUser) {
    return res.status(409).json({
      error: "User with this email already exists",
      message: "A user with this email address already exists. Please try logging in or use a different email."
    })
  }

  // return res.status(201).end() // temporary to skip registration
    
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
      // authProvider: "local",
      // providerId: null,
      rootDirId: userRootDirId
    }], { session })
   await Directory.create([{
      _id: userRootDirId,
      name: `root-${email}`,
      parentDirId: null,
      userId,
      isDirectory: true
    }], { session })

    const loginSession = await Session.create([{ userId }], { session })
    await OTP.deleteMany({ email });
    await session.commitTransaction();

  res.cookie('sid', loginSession[0]._id.toString(), {
    httpOnly: true,
    signed: true,
    sameSite: "lax",
    maxAge: 1000 * 60 * 60 * 24 * 7 ,
  },)
  console.log("loginSession created", req.signedCookies);
  res.status(201).json({ message: 'User Registered and logged in', status: 201 })
    
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
  const { email, password, rememberMe } = req.body
  const foundUser = await User.findOne({ email });
  if (!foundUser) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
 
try{

  const isPasswordValid = await foundUser.comparePassword(password)

  if (!isPasswordValid) {
    return res.status(401).json({ error: 'Invalid Credentials' })
  }

 await Session.deleteMany({ userId: foundUser._id }); 
 res.clearCookie('sid')
  
 const maxAge = rememberMe
      ? 1000 * 60 * 60 * 24 * 7
      : 1000 * 60 * 60 * 24;

  const session = await Session.create({userId: foundUser._id})
  console.log("created session", session);

  res.cookie('sid', session.id.toString(), {
    httpOnly: true,
    signed: true,
    maxAge
  })
  res.status(201).json({ message: 'logged in' })
}catch(err){
  console.log("login err is", err);
  res.end()
}
}


// export const loginWithOtp = async (req, res) => {
//   const { email, otp } = req.body;

//   try {
//     // 1️⃣ Validate OTP again (never trust frontend flow)
//     const otpRecord = await OTP.findOne({ email, otp });
//     if (!otpRecord) {
//       return res.status(400).json({
//         error: "Invalid or expired OTP",
//       });
//     }

//     // 2️⃣ OTP is valid → remove it (one-time means one-time)
//     await OTP.deleteOne({ _id: otpRecord._id });

//     // 3️⃣ Fetch user
//     const user = await User.findOne({ email });
//     if (!user) {
//       return res.status(404).json({
//         error: "User not found",
//       });
//     }

//     // 4️⃣ Enforce session limit
//     const allSessions = await Session.find({ userId: user._id });
//     if (allSessions.length >= 2) {
//       await allSessions[0].deleteOne();
//     }

//     // 5️⃣ Create session
//     const session = await Session.create({
//       userId: user._id,
//     });

//     // 6️⃣ Set auth cookie
//     res.cookie("sid", session.id, {
//       httpOnly: true,
//       signed: true,
//       maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
//     });

//     return res.status(200).json({
//       message: "Login successful",
//     });

//   } catch (err) {
//     console.error("login-otp error:", err);
//     return res.status(500).json({
//       error: "OTP login failed",
//     });
//   }
// };





export const logout = async (req, res) => {
  const { sid } = req.signedCookies;
   if (sid) {
    await Session.findByIdAndDelete(sid);
  }
  await Session.findByIdAndDelete(sid)
  res.clearCookie('sid')
  res.status(204).end()
}