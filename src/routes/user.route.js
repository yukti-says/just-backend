import { Router } from "express";
import { registerUser } from "../controllers/user.controller.js";
import upload from "../middlewares/fileUpload.multer.js";

const router = Router();

// router.use("/register",registerUser)
router.route("/register").post
    (upload.fields([
        { name: "avatar", maxCount: 1 },
        { name: "coverImage", maxCount: 1 }
    ]),
    registerUser);

export default router;