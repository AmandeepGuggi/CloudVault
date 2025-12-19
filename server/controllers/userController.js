import mongoose from "mongoose"
import Directory from "../modals/directoryModal.js"
import User from "../modals/userModal.js"


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
      console.log("err is", err.errorResponse.errInfo.details);
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
  
  const foundUser = await User.exists({ email })
  if (!foundUser) {
    return res.status(409).json({
      error: "User does not exists",
      message: "No user exists with this email account. Please create a new account and then log in."
    })
  }

  const user = await User.findOne({ email, password })
  if (!user) {
    return res.status(404).json({ error: 'Invalid Credentials' })
  }
  const maxAge = 1000 * 60 * 60 * 4   // 4 hours
  res.cookie('uid', user._id.toString(), {
    httpOnly: true,
    maxAge,
    sameSite: "strict",
  })
  res.status(201).json({ message: 'logged in' })
}

export const logout = (req, res) => {
  res.clearCookie('uid')
  res.status(204).end()
}