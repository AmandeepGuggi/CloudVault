import { model, Schema } from "mongoose";

const FilesSchema = new Schema({
    name:{
        type: String,
        required: true
    },
    extension: {
        type: String,
        required: true
    },
    size: { 
        type: Number, 
        // required: true 
    }, 
    userId: {
        type: Schema.Types.ObjectId,
        required: true
    },
    mimeType: {
        type: String,
        required: false
    },
    preview: {
        type: String,
        required: false
    },
    
    parentDirId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: "Directory"
    },
     isStarred: {
        type: Boolean,
        default: false
    },
    isDeleted: {
        type: Boolean,
        default: false,
    },
     deletedAt: {
      type: Date,
      default: null,
    },
}, {
    strict: 'throw',
    timestamps: true, 
    collection: "files"
})
FilesSchema.index(
  { deletedAt: 1 },
  { expireAfterSeconds: 864000 } // 10 days in seconds
);
const Files = model("Files", FilesSchema)
export default Files