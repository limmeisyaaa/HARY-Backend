import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { AppError } from "./app-error";

const appErrorHandler = (
	error: Error,
	_req: Request,
	res: Response,
	_next: NextFunction,
) => {
	if (error instanceof ZodError) {
		res.status(400).json({ message: "Validation failed", errors: error.flatten() });
		return;
	}

	if (error instanceof AppError) {
		res.status(error.statusCode).json({ message: error.message });
		return;
	}

	console.error(error);
	res.status(500).json({ message: "Internal server error" });
};

export default appErrorHandler;