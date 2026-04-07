const ERROR_CODES = require('./errorCodes');

function isJsonParseError(err) {
	return err && err.type === 'entity.parse.failed';
}

function getStatusCode(code) {
	if (code === ERROR_CODES.INVALID_ARGUMENT)
		return 400;
	if (code === ERROR_CODES.FORBIDDEN)
		return 403;
	if (code === ERROR_CODES.TARGET_USER_NOT_FOUND)
		return 404;
	if (code === ERROR_CODES.NOT_FOUND)
		return 404;
	if (code === ERROR_CODES.UNAUTHORIZED_CALLER)
		return 403;
	return 500;
}

function getErrorCode(err) {
	if (isJsonParseError(err))
		return ERROR_CODES.INVALID_ARGUMENT;
	if (err && err.code)
		return err.code;
	return ERROR_CODES.INTERNAL_ERROR;
}

function getResponseMessage(err, statusCode) {
	if (isJsonParseError(err))
		return 'invalid JSON body';
	if (statusCode === 500)
		return 'Internal server error';
	return err.message;
}

function errorHandler(err, req, res, next) {
	const code = getErrorCode(err);
	const statusCode = getStatusCode(code);
	const message = getResponseMessage(err, statusCode);

	res.status(statusCode).json({
		code: code,
		message: message
	});
}

module.exports = errorHandler;