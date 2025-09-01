import { asyncHandler } from "../utils/ayncHandler.js";
import jwt from "jsonwebtoken";
import { User } from "../models/User.model.js";

// to verify if user is or not 

export const verifyJWT = asyncHandler(
    async (req, res, next) => {
        try {
            const token = req.cookies?.accessToken || req.headers?.authorization?.replace("Bearer ", "");

            if (!token) {
                throw new ApiError(401, "Unauthorized request");
            }

            // asking jwt to check whether this token is right or not
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            const user = await User.findById(decoded?._id).select("-password -refreshToken");

            if (!user) {
                throw new ApiError(401, "Unauthorized request");
            }

            req.user = user;
            next();
        }
        catch (error) {
            // next(error);
            throw new ApiError(401, error?.message ||   "Invalid access Token");
        }
    }
)