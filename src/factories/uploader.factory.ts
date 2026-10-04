import multer, { FileFilterCallback, Multer } from "multer"
import AppError from "../errors/app-error"
import { Request } from "express";

const buildUploader = (
    allowedFileTypes: string[],
    maxFileSize: number,
) =>{
    const fileFilter = (
        _req: Request, 
        file: Express.Multer.File,
        cb: FileFilterCallback
    ) => {
        if(!allowedFileTypes.includes(file.mimetype)){
            cb(new AppError("Invalid file type!", 400));
        } else cb(null, true);
    };

    const ONE_MB = 1024 * 1024;
    const limit = {fileSize: maxFileSize * ONE_MB};
    return multer({ fileFilter, limits: limit }) as Multer;
};

export default buildUploader;