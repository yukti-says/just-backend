import { Router } from "express";
import {
  loginUser,
  registerUser,
  loggedOutUser,
} from "../controllers/user.controller.js";
import upload from "../middlewares/fileUpload.multer.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// router.use("/register",registerUser)
router.route("/register").post
    (upload.fields([
        { name: "avatar", maxCount: 1 },
        { name: "coverImage", maxCount: 1 }
    ]),
    registerUser);


router.route("/login").post(
    loginUser
)  

// sucured routes
router.route("/logout").post(verifyJWT, loggedOutUser);
export default router;