class AppError extends Error {
	status?: number | undefined;
	isOperational: boolean = true;
	object?: unknown;
	constructor(
		message?: string,
		status?: number | undefined,
		object?: unknown,
		isOperational: boolean = true,
	) {
		super(message);
		this.status = status;
		this.isOperational = isOperational;
		this.object = object;
		Error.captureStackTrace(this, this.constructor);
	}
}

export default AppError;