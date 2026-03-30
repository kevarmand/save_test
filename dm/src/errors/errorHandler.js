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

function getCallerCommonName(req) {
	const certificate = req.tls && req.tls.peerCertificate;

	if (!certificate || !certificate.subject)
		return undefined;
	return certificate.subject.CN;
}

function buildLogContext(req, err, statusCode, code) {
	return {
		method: req.method,
		path: req.originalUrl,
		statusCode: statusCode,
		code: code,
		message: err.message,
		details: err.details,
		caller: getCallerCommonName(req)
	};
}

function logError(req, err, statusCode, code) {
	const context = buildLogContext(req, err, statusCode, code);

	if (statusCode >= 500) {
		console.error('[dm] request failed', context);
		console.error(err.stack || err);
		if (err.cause) {
			console.error('[dm] cause');
			console.error(err.cause.stack || err.cause);
		}
	}
}

function errorHandler(err, req, res, next) {
	const code = getErrorCode(err);
	const statusCode = getStatusCode(code);
	const message = getResponseMessage(err, statusCode);

	logError(req, err, statusCode, code);
	res.status(statusCode).json({
		code: code,
		message: message
	});
}

module.exports = errorHandler;