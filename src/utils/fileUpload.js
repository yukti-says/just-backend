import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import dotenv from "dotenv";
dotenv.config({ quiet: true });

// Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET, //
});

// console.log(
//   process.env.CLOUDINARY_API_KEY,
//   process.env.CLOUDINARY_CLOUD_NAME,
//   process.env.CLOUDINARY_API_SECRET
// );

// Upload an image
const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) {
      return null;
    }
    // upload image to cloudinary
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });
    // file has been uploaded
      // console.log("file uploaded to Cloudinary =>", response.url);
      fs.unlinkSync(localFilePath);
    return response;
  } catch (error) {
    fs.unlinkSync(localFilePath); // remove file from local uploads folder
    console.log("Error uploading file to Cloudinary", error);
    return null;
  }
};

export { uploadOnCloudinary };
