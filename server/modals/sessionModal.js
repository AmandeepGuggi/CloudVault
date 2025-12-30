import mongoose, { Schema, model } from "mongoose";

const sessionSchema = new Schema({
  userId:{
    type: mongoose.Types.ObjectId,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 3600,
  }

}, {
    strict: "throw",
    collection: "session"
})

const Session = model("session", sessionSchema)
export default Session