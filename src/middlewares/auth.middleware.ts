import type { NextFunction, Request, Response } from "express";
import { OrganizerRole } from "../generated/prisma";
import { AppError } from "../errors/app-error";
import { verifyAccessToken } from "../modules/auth/auth.service";

export const verifyToken = (req: Request, _res: Response, next: NextFunction) => {
  const authorization = req.headers.authorization;
	const [scheme, token, ...extraParts] = authorization?.trim().split(/\s+/) ?? [];
	if (scheme?.toLowerCase() !== "bearer" || !token || extraParts.length > 0) {
    throw new AppError("A valid bearer token is required!", 401);
  }

  const payload = verifyAccessToken(token);
  if (!payload) throw new AppError("Access token is invalid or expired!", 401);

  req.auth = payload;
  next();
};

export const userTypeGuard = (userType: "CUSTOMER" | "ORGANIZER") =>
  (req: Request, _res: Response, next: NextFunction) => {
		if (!req.auth) throw new AppError("Authentication is required!", 401);
		if (req.auth.userType !== userType) {
      throw new AppError("Unauthorized access!", 403);
    }
    next();
  };

export const roleGuard = (...roles: OrganizerRole[]) =>
  (req: Request, _res: Response, next: NextFunction) => {
    if (!req.auth) throw new AppError("Authentication is required!", 401);
    if (req.auth.userType !== "ORGANIZER") {
      throw new AppError("Unauthorized access!", 403);
    }

    if (roles.length > 0 && !roles.includes(req.auth.role)) {
      throw new AppError("Insufficient organizer role!", 403);
    }

    next();
  };