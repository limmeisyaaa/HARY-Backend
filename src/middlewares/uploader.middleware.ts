import buildUploader from "../factories/uploader.factory";

export const imageUploader = (
    allowedMimeTypes: string[] = [
        "image/jpg", 
        "image/jpeg", 
        "image/gif", 
        "image/png", 
        "image/webp"], 
    maxFileSize: number = 5
) => buildUploader(allowedMimeTypes, maxFileSize);

export const fileUploader = (
    allowedMimeTypes: string[] = [
        "application/pdf",
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "text/plain",
    ],
    maxFileSize: number = 5
) => buildUploader(allowedMimeTypes, maxFileSize);