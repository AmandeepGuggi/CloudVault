import mongoose from "mongoose"
import Directory from "../modals/directoryModal.js"
import User from "../modals/userModal.js"
import Session from "../modals/sessionModal.js"
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import bcrypt from 'bcrypt'

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({
  path: path.resolve(__dirname, "../.env"),
  debug: false,
});

export const registerUser = async (req, res, next) => {
  const { fullname, email, password } = req.body
  const foundUser = await User.exists({ email })
  if (foundUser) {
    return res.status(409).json({
      error: "User with this email already exists",
      message: "A user with this email address already exists. Please try logging in or use a different email."
    })
  }
  const session = await mongoose.startSession();

  // Start transaction properly
  session.startTransaction();

  try {
    const userRootDirId = new mongoose.Types.ObjectId();
     const userId = new mongoose.Types.ObjectId();
   const hashedPassword = await bcrypt.hash(password, 12)
     
    await User.create([{
      _id: userId,
      fullname,
      email,
      password: hashedPassword,
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
  const foundUser = await User.findOne({ email }).lean();
  if (!foundUser) {
    return res.status(409).json({
      error: "Invalid Credentials",
      message: "No user exists with this email account or wrong email/password entered."
    })
  }
 
try{

  const isPasswordValid = bcrypt.compare(password, foundUser.password)

  if (!isPasswordValid) {
    return res.status(404).json({ error: 'Invalid Credentials' })
  }

  const session = await Session.create({userId: foundUser._id})


  res.cookie('sid', session.id, {
    httpOnly: true,
    signed: true,
    maxAge: 1000 * 60 * 60 * 24 * 7 ,
    sameSite: "strict",
  })
  res.status(201).json({ message: 'logged in' })
}catch(err){
  console.log("login err is", err);
  res.end()
}
}

export const logout = (req, res) => {
  res.clearCookie('sid')
  res.status(204).end()
}