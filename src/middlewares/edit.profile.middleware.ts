import type { NextFunction, Request, Response } from "express";
import AppError from "../errors/app-error";

export const verifyEmail = (
  req: Request, 
  res: Response, 
  next: NextFunction
) => {
		if (!req.auth) throw new AppError("Authentication is required!", 401);

    const email = req.body?.email;

		if (email && req.auth.email !== email) {
      throw new AppError("Email Cannot be Change!", 401);
    } 

    next();
  };