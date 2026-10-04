import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { ZodError } from "zod";
import type { $ZodIssue } from "zod/v4/core";
import AppError from "./app-error";

export const errorNormalizer = (
	error: AppError,
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
	error: AppError,
	_req: Request,
	res: Response,
	_next: NextFunction,
) => {
	//console.table(error);
	return res.status(error.status || 500).send({
		status: error.status || 500,
		message: error.message || "Internal Server Error",
		error: error.object || null,
	});
};

export default appErrorHandler;