import { asyncHandler } from "../utils/ayncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/User.model.js";
import isValidEmail from "../utils/EmailValidation.js";
import { fileUpload } from "../utils/fileUpload.js";
import { ApiResponse } from "../utils/ApiResponse.js";


const registerUser = asyncHandler(async (req, res) => {
    //    getting user details from frontend
    const { username, fullname, email, password } = req.body;
    // console.log(email);
    
    // adding validations -> not empty
    // if (fullname === "") throw new ApiError(400, "Fullname is required");
    // if (username === "") throw new ApiError(400, "Username is required");
    // if (email === "") throw new ApiError(400, "Email is required");
    // if (password === "") throw new ApiError(400, "Password is required");
    if (
        [fullname, username, email, password].some(field => field?.trim() === "")
    ) throw new ApiError(400, "All fields are required");

    if (!isValidEmail(email)) {
        throw new ApiError(400, "Invalid email format");
    }

    // check if user is already exist or not through username or email
    const existingUser = await User.findOne({
        $or: [{ email }, { username }]
    });
    if (existingUser) {
        throw new ApiError(409, "User already exists");
    }

    // check if there is files are not images and avatar
    const avatarLocalPath = req.files?.avatar[0].path;

    const coverImageLocalPath = req.files?.coverImage[0].path;

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar is required");
    }

    if (!coverImageLocalPath) {
        throw new ApiError(400, "Cover image is required");
    }

    // upload them to cloudinary,check avatar
    const avatar = await fileUpload(avatarLocalPath);
    const coverImage = await fileUpload(coverImageLocalPath);

    // checking avatar upload or not
    if (!avatar) {
        throw new ApiError(400, "Avatar upload failed");
    }


    // creating user object-create entry in db

    const user = await User.create({
        username: username.toLowerCase(),
        fullname,
        email,
        password,
        avatar: avatar.url,
        coverImage: coverImage?.url || "" //corner case bz this is not optional
    });

    const createUser = await User.findById(user._id).select(
        "-password -refreshToken"
    );//user details will be shown but these two fields will not be
 if (!createUser) {
        throw new ApiError(400, "User creation failed");
    }

    // remove password and refresh token from response sot that client does not get it


    user.password = undefined;
    user.refreshToken = undefined;


    // check for user creation
    if (!user) {
        throw new ApiError(400, "User creation failed");
    }
    // so return response if not so send errors

    if (createUser) {
        res.status(201).json(new ApiResponse(201, "User created successfully", createUser));
    } else {
        throw new ApiError(400, "User creation failed");
    }

});

export { registerUser };