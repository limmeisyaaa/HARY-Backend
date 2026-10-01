import type { CookieOptions } from "express";
import { IS_PROD } from "./env.config";

const cookieConfig: CookieOptions = {
	httpOnly: true,
	secure: IS_PROD,
	sameSite: IS_PROD ? "none" : "lax",
	maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

export default cookieConfig;