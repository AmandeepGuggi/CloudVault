import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";
import OTP from "../modals/otpModal.js";
import User from "../modals/userModal.js";
import { verifyIdToken } from "../services/googleAuthService.js";
import { sendOtpService } from "../services/sendOtpService.js";
import Directory from "../modals/directoryModal.js";
import Session from "../modals/sessionModal.js";
import { getGithubUser } from "../services/githubAuthService.js";
import { UAParser } from "ua-parser-js";
import { parseDevice } from "../services/parseDevice.js";
import redisClient from "../config/redis.js";

// const parseDevice = (userAgent) => {
//   const parser = new UAParser(userAgent);
//   const result = parser.getResult();

//   const browser = result.browser.name || "Unknown Browser";
//   const os = result.os.name || "Unknown OS";

//   return `${browser} on ${os}`;
// };

export const sendOtp = async (req, res) => {
  const { email } = req.body;
  await sendOtpService(email);
  res.json({ message: `OTP Sent on ${email}` });
};
export const sendRegisterOtp = async (req, res) => {
  const { email } = req.body;
  const userExists = await User.exists({ email });
  console.log("does user exist", userExists);
  if (userExists) {
    return res.status(409).json({ error: "User already exists" });
  }
  await sendOtpService(email);
  res.json({ message: `OTP Sent on ${email}` });
};

export const verifyOtp = async (req, res) => {
  const { email, otp } = req.body;
  const otpRecord = await OTP.findOne({ email, otp });
  if (!otpRecord) {
    return res.status(400).json({ error: "Invalid or expired OTP" });
  }
  // otpRecord.deleteOne()
  const updatedOtp = await OTP.updateOne(
    { email },
    { $set: { verified: true } }
  );
  console.log("object", updatedOtp);
  res.json({ msg: "otp verified" });
};

export const loginWithGoogle = async (req, res, next) => {
  // Implementation for Google login
  const { idToken } = req.body;
  const userData = await verifyIdToken(idToken);

  const { email } = userData;

  let user = await User.findOne({ email })
    .select("-__v -createdAt -updatedAt -authProvider ")
    
  if (user) {
  if(user.isDeleted){
   return res.status(403).json({error: "your account is deleted contact admin"})
  }

    const MAX_SESSIONS = 3;
    const activeSessions = await redisClient.ft.search(
    "userIdIdx", 
    `@userId:{${user.id}}`)
   if (activeSessions.total >= MAX_SESSIONS) {
      await redisClient.del(activeSessions.documents[0].id)
    }

    if (!user.picture.includes("googleusercontent.com")) {
      user.picture = userData.picture;
      // await user.save()
      await User.updateOne(
        { _id: user._id },
        { $set: { picture: userData.picture } }
      );
    }
    const maxAge = 1000 * 60 * 60 * 24 * 7

    const sessionId = crypto.randomUUID()
      const redisKey = `session:${sessionId}`
      await redisClient.json.set(redisKey, "$", {
        userId: user._id,
        userAgent: req.headers["user-agent"],
            ipAddress: req.ip,
            deviceName: parseDevice(req.headers["user-agent"]),
            lastActiveAt: new Date(),
            isRevoked: false,  
      
      } )
      redisClient.expire(redisKey, maxAge/1000)

    
    res.cookie("sid", sessionId, {
      httpOnly: true,
      signed: true,
      sameSite: "lax",
      maxAge:maxAge
    });
    return res.status(201).json({ message: "User Logged In", user });
  }
  const mongooseSession = await mongoose.startSession();

  // Start transaction properly
  mongooseSession.startTransaction();

  try {
    const userRootDirId = new mongoose.Types.ObjectId();
    const userId = new mongoose.Types.ObjectId();

    const newUser = await User.insertOne(
      {
        _id: userId,
        fullname: userData.name,
        email: userData.email,
        picture: userData.picture,
        authProvider: "google",
        rootDirId: userRootDirId,
        storageUsed: 0
      },
      { mongooseSession }
    );
    await Directory.create(
      [
        {
          _id: userRootDirId,
          name: `root-${email}`,
          parentDirId: null,
          userId,
          isDirectory: true,
          isStarred: false,
          isDeleted: false
        },
      ],
      { mongooseSession }
    );
      const maxAge = 1000 * 60 * 60 * 24 * 7;
     const sessionId = crypto.randomUUID()
      const redisKey = `session:${sessionId}`
      await redisClient.json.set(redisKey, "$", {
        userId: newUser._id,
        userAgent: req.headers["user-agent"],
            ipAddress: req.ip,
            deviceName: parseDevice(req.headers["user-agent"]),
            lastActiveAt: new Date(),
            isRevoked: false,  
      
      },{
      mongooseSession,
    } )
      redisClient.expire(redisKey, maxAge/1000)

  
    const sid = sessionId;
    res.cookie("sid", sid, {
      httpOnly: true,
      signed: true,
      sameSite: "lax",
      maxAge: 1000 * 60 * 60 * 24 * 7,
    });
    await mongooseSession.commitTransaction();
    res.status(201).json({ message: "User Registered and logged in", sid, user: newUser });
  } catch (err) {
    next(err);
  } finally {
    await mongooseSession.endSession();
  }
  // res.json({msg: "Google login endpoint hit", user})
};



export const githubCallback = async (req, res, next) => {
  const { code } = req.query;
  const redirectURL = `${process.env.CLIENT_BASE_URL}/app`;
  const userData = await getGithubUser(code);
  const { email } = userData;

  let user = await User.findOne({ email })
    .select("-__v -createdAt -updatedAt -authProvider")
    .lean();
  if (user) {
    if(user.isDeleted){
   return res.status(403).json({error: "your account is deleted contact admin"})
  }
     const MAX_SESSIONS = 3;
    const activeSessions = await redisClient.ft.search(
    "userIdIdx", 
    `@userId:{${user.id}}`)
   if (activeSessions.total >= MAX_SESSIONS) {
      await redisClient.del(activeSessions.documents[0].id)
    }

    if (!user.picture.includes("googleusercontent.com")) {
      user.picture = userData.picture;
      // await user.save()
      await User.updateOne(
        { _id: user._id },
        { $set: { picture: userData.picture } }
      );
    }

    const maxAge = 1000 * 60 * 60 * 24 * 7

    const sessionId = crypto.randomUUID()
      const redisKey = `session:${sessionId}`
      await redisClient.json.set(redisKey, "$", {
        userId: user._id,
        userAgent: req.headers["user-agent"],
            ipAddress: req.ip,
            deviceName: parseDevice(req.headers["user-agent"]),
            lastActiveAt: new Date(),
            isRevoked: false,  
      
      } )
      redisClient.expire(redisKey, maxAge/1000)
    
    res.cookie("sid", sessionId, {
      httpOnly: true,
      signed: true,
      sameSite: "lax",
      maxAge: maxAge,
    });
    res.redirect(redirectURL);
    res.status(201).json({ message: "User Logged In", user });
  }
  const mongooseSession = await mongoose.startSession();

  // Start transaction properly
  mongooseSession.startTransaction();

  try {
    const userRootDirId = new mongoose.Types.ObjectId();
    const userId = new mongoose.Types.ObjectId();

    const newUser = await User.insertOne(
      {
        _id: userId,
        fullname: userData.name,
        email: userData.email,
        picture: userData.avatar_url,
        authProvider: "github",
        rootDirId: userRootDirId,
        storageUsed: 0
      },
      { mongooseSession }
    );
    await Directory.create(
      [
        {
          _id: userRootDirId,
          name: `root-${email}`,
          parentDirId: null,
          userId,
          isDirectory: true,
          isStarred: false,
          isDeleted: false
        },
      ],
      { mongooseSession }
    );

    
   const maxAge = 1000 * 60 * 60 * 24 * 7;
     const sessionId = crypto.randomUUID()
      const redisKey = `session:${sessionId}`
      await redisClient.json.set(redisKey, "$", {
        userId: newUser._id,
        userAgent: req.headers["user-agent"],
            ipAddress: req.ip,
            deviceName: parseDevice(req.headers["user-agent"]),
            lastActiveAt: new Date(),
            isRevoked: false,  
      
      },{
      mongooseSession,
    } )
      redisClient.expire(redisKey, maxAge/1000)

   
    
    res.cookie("sid", sessionId, {
      httpOnly: true,
      signed: true,
      sameSite: "lax",
      maxAge: 1000 * 60 * 60 * 24 * 7,
    });
    await mongooseSession.commitTransaction();
    res.redirect(redirectURL);
    res.status(201).json({ message: "User Registered and logged in", user: newUser});
  } catch (err) {
    next(err);
  } finally {
    await mongooseSession.endSession();
  }
};


export const notification = async (req, res) => {
  const userId = req.user._id;

  const user = await User.findById(userId);

  const since = user.lastNotificationSeenAt || new Date(0);

  const newLogins = await Session.find({
    userId,
    createdAt: { $gt: since }
  }).sort({ createdAt: -1 });

  const notifications = newLogins.map(session => ({
    type: "NEW_DEVICE_LOGIN",
    deviceName: session.deviceName,
    time: session.createdAt
  }));

  res.json(notifications);
}

export const notificationSeen =  async (req, res) => {
  await User.findByIdAndUpdate(req.user._id, {
    lastNotificationSeenAt: new Date()
  });

  res.json({ success: true });
}

export const logoutDevice = async (req, res) => {
 const { sessionId } = req.params;
  const currentUserId = req.user._id; // set by auth middleware
console.log(sessionId, currentUserId);
  if (!sessionId) {
    return res.status(400).json({ message: "Session ID is required" });
  }

  const session = await Session.findById(sessionId);

  if (!session) {
    return res.status(404).json({ message: "Session not found" });
  }

  // 🔒 Critical security check
  if (session.userId.toString() !== currentUserId.toString()) {
    return res.status(403).json({ message: "Not allowed to delete this session" });
  }

  await Session.findByIdAndDelete(sessionId);

  return res.status(200).json({
    message: "Device logged out successfully",
  });
}