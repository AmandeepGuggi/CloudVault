import { Schema, model } from "mongoose";

const userSchema = new Schema({
    fullname: {
        type: String,
        required: true,
        minLength: [3, "Kripaya 3 letters ka naam type kariye"],
    },
    email: {
        unique: true,
        type: String,
        required: true,
        match: [
            /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
            "Please enter a valid email",
        ],
        lowercase: true,
        trim: true,
    },
    password: {
        type: String,
        required: true,
        minLength: 8
    },
    rootDirId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: "Directory"
    },
}, {
    strict: "throw",
    collection: "users"
})

const User = model("users", userSchema)
export default User