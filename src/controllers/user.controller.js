import { asyncHandler } from "../utils/ayncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/User.model.js";
import isValidEmail from "../utils/EmailValidation.js";
import { uploadOnCloudinary } from "../utils/fileUpload.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from 'jsonwebtoken'



const generateAccessTokenAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId);
       const accesstoken =  user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        // adding refreshtoken into the user document adding into an object saved into db
        user.refreshToken = refreshToken;
        await user.save({validateBeforeSave: false}); //sheedha jaake save kar do


        return { accesstoken, refreshToken };

    }
    catch (error) {
        throw new ApiError(500, "something went wrong while generating refresh and access token");
    }
}

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

    // const coverImageLocalPath = req.files?.coverImage[0]?.path;
    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path;
     }

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar is required");
    }

    // if (!coverImageLocalPath) {
    //     throw new ApiError(400, "Cover image is required");
    // }

    // upload them to cloudinary,check avatar
    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

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


    // user.password = undefined;
    // user.refreshToken = undefined;


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


const loginUser = asyncHandler(async (req,res) => {
  // request body se data
  const { email, password, username } = req.body;
  // check username or email is there or not
  if (!(username || email)) {
    throw new ApiError(400, "Username or email is required");
  }
  //& find the user in the db
  const user = await User.findOne({ $or: [{ email }, { username }] });
  if (!user) {
    throw new ApiError(404, "User not found");
  }
  // if user exists so check the password
  const ispasswordMatched = await user.isPasswordCorrect(password);
  if (!ispasswordMatched) {
    throw new ApiError(401, "Invalid email or password");
  }
  // if checked so access and refresh token generate and send to the client

  const { accesstoken, refreshToken } =
    await generateAccessTokenAndRefreshToken(user._id);

  // set http only cookie for refresh token and send into cookies
  // remove password and access token
  const loggedUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  const options = {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  };

    // send response and cookies
    
    return res
        .status(201)
        .cookie("refreshToken", refreshToken, options)
        .cookie("accessToken", accesstoken, options)
        .json(new ApiResponse(
            200,
            "Login successful",
            {
            user: loggedUser,
            accesstoken,
            refreshToken,
            },
        ))
})


const loggedOutUser = asyncHandler(async (req, res) => {
    // find the user by id using middleware
    await User.findByIdAndUpdate(req.user._id,
        {
            $set: {
                refreshToken: undefined
            }
        },
        {
            new: true
        }
    );
    const options = {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
    };

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiError(200,
            {},
        "User logged Out."
    ))

});


//& creating a endpoint for the users for if they get 401 and still wonna have to recreate session without entering email and password again, a new access token will be given to him by checking the token stored in the db
// todo

const refreshAccessToken = asyncHandler(async (req, res) => { 
    //? access from cookie and for mobile app so get from req.body
    const incomingRefreshToken = req.cookie.refreshToken || req.body.refreshToken;
    if (!incomingRefreshToken) throw new ApiError(401, "Unauthorized request");

    try {
        //? verify both the token with the help of jwt
        const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);

        //? search for user
        const user = await User.findById(decodedToken?.userId);
        if (!user) throw new ApiError(401, "invalid request Token");

        //? check if refresh token is in db
        const isRefreshTokenValid = user?.refreshToken === incomingRefreshToken;
        if (!isRefreshTokenValid) throw new ApiError(401, "Refresh Token is expired or used");

        //? if everything is good then generate new access token
        // const newAccessToken = jwt.sign({ userId: user._id }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "15m" });

        const options = {
            expiresIn: "15m",
            httpOnly: true,
            secure: true,
        };

        const { accesstoken: newAccessToken, refreshToken: newRefreshToken } = await generateAccessTokenAndRefreshToken(user._id);

        return res
            .status(200)
            .cookie("accessToken", newAccessToken, options)
            .cookie("refreshToken", newRefreshToken, options)
            .json(new ApiResponse(
                200,
                "Access token refreshed successfully",
                {
                    accessToken: newAccessToken,
                    refreshToken: newRefreshToken,
                }
            ));
    }
    catch (error) {
        throw new ApiError(401, error?.message || "Could not refresh access token");
    }

    


})

const changeCurrentPassword = asyncHandler(
     async(req,res) =>  {
        //*things you have to decide is the how many field u are going to take from {req.body}
        const { oldPassword, newPassword , confirmPassword } = req.body;

        //* find the old user since user is able to change password thus he is logged in and in middleware we have req.use so from here we can get req._id

        const user = await User.findById(req.user._id);

         const isPasswordCorrectthistime =   await user.isPasswordCorrect(oldPassword); //returns true or false

        if (!isPasswordCorrectthistime) throw new ApiError(400, "Old password is incorrect");
        
        if (newPassword !== confirmPassword) throw new ApiError(400, "New password and confirm password do not match");

        // * till now your old password was correct now u have to set up new password

        user.password = newPassword;
        //* this will hash the new password before saving and in .pre method in user.model.js file
        await user.save({ validateBeforeSave: false});

        return res.status(200).json(new ApiResponse(200, "Password changed successfully"));
    }
)

//* get current user

const getCurrentUser = asyncHandler(async (req, res) => {
   return res.status(200).json(new ApiResponse(200, "Current user fetched successfully", req.user));
});


//* update account if you want to update files so create another seperate files for them
const updateAccount = asyncHandler(async (req, res) => {
    const {  fullname, email } = req.body;
    
    if (!fullname || !email) throw new ApiError(400, "Fullname and email are required");

    //* find the user
    // const user = await User.findById(req.user?._id);
    // if (!user) throw new ApiError(404, "User not found");

    if (!isValidEmail(email)) throw new ApiError(400, "Invalid email format");

    //
    
    //todo or

    const user = User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                fullname:fullname,
                email:email
            }

        },
        {new:true}
    ).select("-password")

    return res
        .status(200)
        .json(new ApiResponse(200, "User updated successfully", user));
    



    

 })
export {
  registerUser,
  loginUser,
  loggedOutUser,
  refreshAccessToken,
  changeCurrentPassword,
    getCurrentUser,
    updateAccount
};
