import { v2 as cloudinary } from "cloudinary";
import AppError from "../../errors/app-error";
import { DIRECTORY_CLOUDINARY } from "../../config/env.config";

export const uploadProfilePicture = async (
  file: Express.Multer.File, 
  email: string, 
  userType: string
): Promise<string> => {
  if (!file) {
    throw new AppError("No file provided!", 400);
  }

  let fileSource: string;
  
  if (file.buffer) {
    const base64Data = file.buffer.toString("base64");
    fileSource = `data:${file.mimetype};base64,${base64Data}`;
  } else if (file.path) {
    fileSource = file.path;
  } else {
    throw new Error("Format file tidak valid.");
  }

  const result = await cloudinary.uploader.upload(fileSource, {
    folder: `${DIRECTORY_CLOUDINARY}/profile_pictures/${userType.toLowerCase()}/${email}`,
    resource_type: "image"
  });

  return result.secure_url;
};
