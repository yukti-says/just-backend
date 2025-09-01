import { asyncHandler } from "../utils/ayncHandler.js";
import jwt from "jsonwebtoken";
import { User } from "../models/User.model.js";
import { ApiError } from "../utils/ApiError.js";
import dotenv from "dotenv";
dotenv.config();

export const verifyJWT = asyncHandler(async (req, _, next) => {
  try {
    let token = req.cookies?.accessToken;
    if (!token) {
      const authHeader = req.header("Authorization");
      if (authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.substring(7).trim();
      }
    }

    if (!token) {
      throw new ApiError(401, "Unauthorized request");
    }

    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    console.log("[verifyJWT] Decoded token:", decodedToken);

    const user = await User.findById(decodedToken?.userId).select(
      "-password -refreshToken"
    );

    if (!user) {
      throw new ApiError(401, "Invalid access token");
    }

    req.user = user;
    next();
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid access token");
  }
});
