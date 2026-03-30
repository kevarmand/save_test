class AppError extends Error {
	constructor(code, message, options = {}) {
		if (options.cause)
			super(message, {cause: options.cause});
		else
			super(message);
		this.name = 'AppError';
		this.code = code;
		this.details = options.details;
		Error.captureStackTrace(this, AppError);
	}
}

module.exports = AppError;