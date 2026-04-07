const ERROR_CODES = require('./errorCodes');

function getStatusCode(code) {
	if (code === ERROR_CODES.INVALID_ARGUMENT)
		return 400;
	if (code === ERROR_CODES.UNAUTHORIZED)
		return 401;
	if (code === ERROR_CODES.NOT_FOUND)
		return 404;
	return 500;
}

function getErrorCode(err) {
	if (err && err.code)
		return err.code;
	return ERROR_CODES.INTERNAL_ERROR;
}

function getResponseMessage(err, statusCode) {
	if (statusCode === 500)
		return 'Internal server error';
	return err.message;
}

function errorHandler(err, req, res, next) {
	const code = getErrorCode(err);
	const statusCode = getStatusCode(code);
	const message = getResponseMessage(err, statusCode);

	return res.status(statusCode).json({
		code: code,
		message: message
	});
}

module.exports = errorHandler;