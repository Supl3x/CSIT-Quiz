import mongoose from "mongoose";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken";

const userSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        minlength: 2,
        maxlength: 100
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        match: [
            /^[a-zA-Z]+[0-9]+@cloud\.neduet\.edu\.pk$/,
            "Email must be a valid university Cloud ID (e.g., siddiqui4720797@cloud.neduet.edu.pk)", 
        ]
    },
    password: {
        type: String,
        required: true,
        trim: true,
        select: false,
        minlength: 8,
        maxlength: 200
    },
    role: {
        type: String,
        required: true,
        enum: ["student", "teacher", "admin"]
    },
    avatar: {
        type: String,
        default: null
    },
    lastLogin: {
        type: Date
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    profileCompleted: { type: Boolean, default: false },
}, {timestamps: true})



userSchema.pre("save", async function(next) {
    if(!this.isModified("password") ) return next(); 
    this.password = await bcrypt.hash(this.password, 10) 
    next()
})

userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password)
}

userSchema.methods.generateAccessToken = function(){
    return jwt.sign({
        _id: this._id,
        role: this.role,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRY || "20m"
    }
)
}


const User = mongoose.model("User", userSchema);
export default User;
