import mongoose from "mongoose"
import Directory from "../modals/directoryModal.js"
import User from "../modals/userModal.js"
import Session from "../modals/sessionModal.js"
import OTP from "../modals/otpModal.js";
import Files from "../modals/fileModal.js";
import redisClient from "../config/redis.js";
import { parseDevice } from "../services/parseDevice.js";


export const verifyOtp = async (req, res) => {
  const { email, otp } = req.body;
 
  console.log("object", updatedOtp);
  res.json({ msg: "otp verified" });
};

export const registerUser = async (req, res, next) => {
  const { fullname, email, password, otp } = req.body
  console.log({ fullname, email, password, otp });
   const otpRecord = await OTP.findOne({ email });
  if(otpRecord && otpRecord.verified){
    return res.json({ error: "OTP already used" });
  }else if(otpRecord && otpRecord.otp !== otp){
    return res.json({ error: "Invalid OTP" });
  }else if (!otpRecord) {
    return res.json({ error: "expired OTP" });
  }
  
  const updatedOtp = await OTP.updateOne(
    { email },
    { $set: { verified: true } }
  );
  console.log("updatedOtp", updatedOtp);
  if(updatedOtp.modifiedCount === 0){
    return res.json({ error: "OTP verification failed" });
  }else if (updatedOtp.modifiedCount >= 1){

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
      authProvider: "local",
      rootDirId: userRootDirId,
      storageUsed: 0
    }], { session })
   await Directory.create([{
      _id: userRootDirId,
      name: `root-${email}`,
      parentDirId: null,
      userId,
      isDirectory: true
    }], { session })

    const maxAge = 1000 * 60 * 60 * 24 * 7;
      
    const sessionId = crypto.randomUUID()
  const redisKey = `session:${sessionId}`
  await redisClient.json.set(redisKey, "$", {
    userId: userId,
    userAgent: req.headers["user-agent"],
        ipAddress: req.ip,
        deviceName: parseDevice(req.headers["user-agent"]),
        lastActiveAt: new Date(),
        isRevoked: false,  
  
  } )
  redisClient.expire(redisKey, maxAge/1000)

  res.cookie('sid', sessionId, {
    httpOnly: true,
    signed: true,
    maxAge
  })


    await session.commitTransaction();

  
  // console.log("loginSession created", req.signedCookies);
  const delteOtp = await otpRecord.deleteOne()
  console.log("delted?", delteOtp);
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

  // return res.status(201).end() // temporary to skip registration
    


}

export const loginUser = async (req, res, next) => {
  const { email, password, rememberMe } = req.body
  const foundUser = await User.findOne({ email });
  if (!foundUser) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
  if(foundUser.isDeleted){
   return res.status(403).json({error: "your account is deleted contact admin"})
  }
try{

  const isPasswordValid = await foundUser.comparePassword(password)

  if (!isPasswordValid) {
    return res.status(401).json({ error: 'Invalid Credentials' })
  }
  const MAX_SESSIONS = 3;
  const activeSessions = await redisClient.ft.search(
    "userIdIdx", 
    `@userId:{${foundUser.id}}`)
   if (activeSessions.total >= MAX_SESSIONS) {
      await redisClient.del(activeSessions.documents[0].id)
    }


   

  
 const maxAge = rememberMe
      ? 1000 * 60 * 60 * 24 * 7
      : 1000 * 60 * 60 * 24;

  
  const sessionId = crypto.randomUUID()
  const redisKey = `session:${sessionId}`
  await redisClient.json.set(redisKey, "$", {
    userId: foundUser._id,
    userAgent: req.headers["user-agent"],
        ipAddress: req.ip,
        deviceName: parseDevice(req.headers["user-agent"]),
        lastActiveAt: new Date(),
        isRevoked: false,  
  
  } )
  redisClient.expire(redisKey, maxAge/1000)

  res.cookie('sid', sessionId, {
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

export const getUserDetails = async (req, res) => {
  
  res.status(200).json({
    name: req.user.fullname,
    email: req.user.email,
    picture: req.user.picture,
    storage:  req.user.storageUsed,
    role: req.user.role
  })
}



export const logout = async (req, res) => {
  const { sid } = req.signedCookies;
  const {userId} = req.user
  // if (!sid) {
  //   return res.status(204).end();
  // }
  // await redisClient.del(`session:${sid}`)
  // res.clearCookie("sid");
  // res.status(204).end();
  try {
  if (sid) {
    await redisClient.del(`session:${sid}`);
  }

  res.clearCookie("sid", {
    httpOnly: true,
    signed: true,
  });

  return res.sendStatus(204);

} catch (err) {
  console.log(err);
  return res.status(500).json({ error: "Logout failed" });
}

};

export const logoutAll = async (req, res) => {
  const userId = req.user._id;

  // 🔥 Kill all sessions for this user
  await Session.deleteMany({ userId });

  // 🔥 Remove current session cookie
  res.clearCookie("sid");

  res.status(204).end();
};

export const getAllUsers = async (req, res) => {
  const allUsers = await User.find({deleted: false}).lean()
  const allSessions = await Session.find().lean()
  const allSessionsId = allSessions.map(({userId})=> userId.toString() )
  const allSessionsUserIdSet = new Set(allSessionsId)

  const transformedUsers = allUsers.map(({_id, fullname, email, role}) => ({
    id: _id,
    name: fullname,
    email,
    isLoggedIn: allSessionsUserIdSet.has(_id.toString()),
    role
  }))
  res.status(200).json(transformedUsers)
}

export const logoutSpecificUser = async (req, res) => {
  console.log(req.params);
    const {id} = req.params

  // 🔥 Kill all sessions for this user
  await Session.deleteMany({ userId: id });

  res.status(204).end();
}
export const delteSpecificUser = async (req, res) => {
    const {id} = req.params
    if(req.user._id.toString()=== id){
      return res.status(403).json({error: "you cannot delete yourself"})
    }

  try{
    await User.updateOne({ _id: id },
  { $set: { deleted: true } })
    await Session.deleteMany({ userId: id });
    // await User.deleteOne({_id: id})
    // await Directory.deleteMany({ userId: id })
    // await Files.deleteMany({ userId: id })
  res.status(204).end();
  }catch(err){
    console.log("error deleting specific user", err);
    res.json({err: "error deleting user"})
  }
}