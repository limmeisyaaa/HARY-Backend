import type { NextFunction, Request, Response } from "express";
import { OrganizerRole } from "../generated/prisma";
import AppError from "../errors/app-error";
import AuthService from "../modules/auth/auth.service";
import { ACCESS_SECRET } from "../config/env.config";
import { AuthPayload } from "../interfaces/auth-payload.interface";

export const verifyAccessToken = async (
  req: Request, 
  res: Response, 
  next: NextFunction
) => {
  const token = req.headers.authorization?.split(' ')[1] || "";
  if (!token) throw new AppError("A valid bearer token is required!", 401);

  const decoded = AuthService.verifyToken(token, ACCESS_SECRET);

  if (!decoded) throw new AppError("Access token is invalid or expired!", 401);

  //Make sure if userType is ORGANIZER, role must be present in the token
  const payload = decoded as AuthPayload;
  if(payload.userType === "ORGANIZER" && !payload.role) {
    throw new AppError("Organizer role is missing in the token!", 401);
  }

  req.auth = payload;
  
  next();
};

export const userTypeGuard = (userType: "CUSTOMER" | "ORGANIZER") => (
  req: Request, 
  res: Response, 
  next: NextFunction
) => {
		if (!req.auth) throw new AppError("Authentication is required!", 401);

		if (req.auth.userType !== userType) throw new AppError("Unauthorized access!", 403);

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