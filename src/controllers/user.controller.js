import { asyncHandler } from "../utils/ayncHandler.js";

const registerUser = asyncHandler(async (req, res) => {
    // Registration logic here
    res.status(201).json({ success: true, message: "User registered successfully" });
});

export { registerUser };