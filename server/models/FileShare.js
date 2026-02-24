import mongoose from "mongoose";

const fileShareSchema = new mongoose.Schema(
  {
    fileId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Files",
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "users",
    },
    recipientUserId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
      ref: "users",
    },
    recipientEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    permission: {
      type: String,
      enum: ["viewer", "commenter", "editor"],
      default: "viewer",
    },
    status: {
      type: String,
      enum: ["pending", "accepted"],
      default: "pending",
    },
    token: {
      type: String,
      required: true,
    },
  },
  {
    strict: "throw",
    timestamps: true,
    collection: "file_shares",
  }
);

fileShareSchema.index({ fileId: 1, recipientEmail: 1 }, { unique: true });

const FileShare = mongoose.model("file_shares", fileShareSchema);
export default FileShare;
