import mongoose, { Schema, model } from "mongoose";

const sessionSchema = new Schema({
  userId:{
    type: mongoose.Types.ObjectId,
    ref: "User",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 36000,
  },
  expiresAt: {
  type: Date,
  // required: true,
},
  userAgent: {
    type: String
  },
  deviceName: {
    type: String
  },
  deviceId: {
  type: String,
  // required: true,
  // index: true,
},
  ipAddress: {
    type: String
  },
  location: {
    type: String
  },
  isRevoked: {
    type: Boolean,
    default: false
  },
  revokedAt: {
    type: Date
  },
revokedBy: {
  type: mongoose.Types.ObjectId,
  ref: "User",
},
  lastActiveAt: {
    type: Date,
    default: Date.now,
    // index: true,
  },
refreshTokenHash: {
      type: String,
      // required: true,
      // index: true,
    },
}, {
    strict: true,
    collection: "session"
})

const Session = model("session", sessionSchema)
export default Session