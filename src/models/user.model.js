import mongoose ,  {Schema} from "mongoose";
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'

const userSchema = new Schema({

    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        minlength: 3,
        maxlength: 30,
        lowercase: true,
        index:true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        
    },

    fullname: {
        type: String,
        required: true,
        trim: true,
        index:true,
    },
    avatar: {
        type: String,
        default: null,
        required: true,
    },
    coverImage: {
        type: String,

    },
    watchHistory: [
       { type:Schema.Types.ObjectId,
        ref:'Video'}
    ],
    password: {
        type: String,
        required: [true, "Password is required"],
        minlength: 6,
    },
    refreshToken: {
        type: String,
        default: null,
    },

},
{ timestamps: true})

userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    
    this.password = await bcrypt.hash(this.password, 10);
    next();

})
// custom methods
userSchema.methods.isPasswordCorrect = async function (password) {
   return await bcrypt.compare(password,this.password)
}

userSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        {
            userId: this._id,
            username: this.username,
            email: this.email,
            fullname: this.fullname
         },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: process.env.ACCESS_TOKEN_EXPIRY || '2d' }
    );
}

userSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
      {
        userId: this._id,
        username: this.username,
        email: this.email,
        fullname: this.fullname,
      },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: process.env.REFRESH_TOKEN_EXPIRY || "11d" }
    );
}



export const User  = mongoose.model('User', userSchema);