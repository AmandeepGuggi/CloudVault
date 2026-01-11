import { Schema, model } from "mongoose";
import bcrypt from 'bcrypt'

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
     authProvider: {
      type: String,
      enum: ["local", "google", "github"],
      required: true,
      default: "local",
    },
    //  providerId: {
    //   type: String,
    //   default: null, // Google sub
    //   index: true,
    // },
   password: {
  type: String,
  minlength: 8,
  required: function () {
    return this.authProvider === "local";
  },
},

    rootDirId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: "Directory"
    },
    picture: {
        type: String,
        default: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRYfAWbelVtedtn8mYCajf5bYv6PJgyMxOR2g&s",
    }
}, {
    strict: "throw",
    timestamps: true,
    collection: "users"
})


userSchema.pre("save", async function () {
    if (!this.password) return;
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.comparePassword = async function (candidatePassword) {
    if (!this.password) return false; 
     return bcrypt.compare(candidatePassword, this.password)
}

const User = model("users", userSchema)
export default User