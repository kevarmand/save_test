function getStatusCode(err) {
	if (err.code === 'INVALID_ARGUMENT')
		return 400;
	if (err.code === 'FORBIDDEN')
		return 403;
	if (err.code === 'TARGET_USER_NOT_FOUND')
		return 404;
	return 500;
}

function errorHandler(err, req, res, next) {
	const statusCode = getStatusCode(err);
	const code = err.code || 'INTERNAL_ERROR';
	const message = statusCode === 500 ? 'Internal server error' : err.message;

	console.error(err);
	res.status(statusCode).json({
		code: code,
		message: message
	});
}

module.exports = errorHandler;
