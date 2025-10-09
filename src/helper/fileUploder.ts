import multer from "multer";
import path from "path";

import { v2 as cloudinary } from "cloudinary";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(process.cwd(), "/uploads"));
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});
export const upload = multer({ storage: storage });

export const uploadToCloudinary = async (file: Express.Multer.File) => {
  try {
    cloudinary.config({
      cloud_name: process.env.cloudinary_cloud_name,
      api_key: process.env.cloudinary_api_key,
      api_secret: process.env.cloudinary_api_secret,
    });

    const result = await cloudinary.uploader.upload(file.path, {
      public_id: file.filename,
    });

    return result; 
  } catch (error) {
    console.error("❌ Upload failed:", error);
    return null; 
  }
};
