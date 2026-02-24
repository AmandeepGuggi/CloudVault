import mongoose from "mongoose";

const shareLinkSchema = new mongoose.Schema({
  fileId: {
    type: String,
    required: true,
    unique: true,
  },
  token: {
    type: String,
    required: true,
  },
  permission: {
    type: String,
    default: "view",
  },
  expiresAt: {
      type: Date,
      default: null,
    },
    revoked: {
        type: Boolean,
        default: false,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      
    },
});

const ShareLink = mongoose.model("ShareLink", shareLinkSchema);

export default ShareLink;
