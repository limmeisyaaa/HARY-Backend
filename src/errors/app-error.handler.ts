import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { ZodError } from "zod";
import type { $ZodIssue } from "zod/v4/core";
import AppError from "./app-error";

export const errorNormalizer = (
	error: unknown,
	_req: Request,
	_res: Response,
	next: NextFunction,
) => {
	const { JsonWebTokenError, TokenExpiredError } = jwt;

	if (error instanceof TokenExpiredError) {
		return next(new AppError("Token expired", 401, error));
	}

	if (error instanceof JsonWebTokenError) {
		return next(new AppError("Invalid token", 401, error));
	}

	if (error instanceof ZodError) {
		const messages = error.issues
			.map((err: $ZodIssue) => `${err.path.join(" ")}: ${err.message}`)
			.join("; ");

		return next(new AppError(messages, 400, error.issues));
	}

	return next(error);
};

const appErrorHandler = (
	error: unknown,
	_req: Request,
	res: Response,
	_next: NextFunction,
) => {
	const isOperationalError = error instanceof AppError && error.isOperational;
	if (!isOperationalError) {
		console.error(error);
	}

	const status = isOperationalError ? error.status || 500 : 500;
	return res.status(status).json({
		status,
		message: isOperationalError ? error.message || "Internal Server Error" : "Internal Server Error",
		error: isOperationalError ? error.object || null : null,
	});
};

export default appErrorHandler;