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
        default: false
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

const Files = model("Files", FilesSchema)
export default Files