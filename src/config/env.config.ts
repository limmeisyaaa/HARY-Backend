import "dotenv/config";

export const APP_NAME = process.env.APP_NAME;
export const APP_PORT = process.env.APP_PORT;

export const DATABASE_URL = process.env.DATABASE_URL;
export const DIRECT_URL = process.env.DIRECT_URL;

export const APP_ENV = process.env.APP_ENV;

export const IS_PROD = APP_ENV === "production";

export const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

export const SALT_ROUNDS = process.env.SALT_ROUNDS || 10;

export const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || "fallback-secret-access";
export const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "fallback-secret-refresh";
export const ACCESS_EXPIRES_IN = process.env.JWT_ACCESS_EXPIRES_IN || "1m";
export const REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || "1d";

export const GOOGLE_AUTH_CLIENT_ID = process.env.GOOGLE_AUTH_CLIENT_ID || "";
export const CLOUDINARY_URL = process.env.CLOUDINARY_URL || "";
export const DIRECTORY_CLOUDINARY = process.env.DIRECTORY_CLOUDINARY;

export const NON_ACTIVATE_COUPON=process.env.NON_ACTIVATE_COUPON || "0 0 * * *";
export const NON_ACTIVATE_POINT=process.env.NON_ACTIVATE_POINT || "0 0 * * *";
