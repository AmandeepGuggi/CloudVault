import { model, Schema } from "mongoose";

const directorySchema = new Schema({
    name:{
        type: String,
        required: true
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    parentDirId: {
        type: Schema.Types.ObjectId,
        default: null,
        ref: "Directory"
    },
    isDirectory: {
        type: Boolean,
        required: true,
        default: true
    },
    isStarred: {
        type: Boolean,
        default: false
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
}, {
    strict: 'throw',
    timestamps: true,
    collection: "directories"
})


const Directory = model("directories", directorySchema)
export default Directory