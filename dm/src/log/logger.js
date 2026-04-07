function getCallerCommonName(req) {
	const certificate = req.tls && req.tls.peerCertificate;

	if (!certificate || !certificate.subject)
		return undefined;
	return certificate.subject.CN;
}

function buildHttpContext(req) {
	return {
		method: req.method,
		path: req.originalUrl,
		caller: getCallerCommonName(req),
		authorized: req.tls && req.tls.authorized,
		authorizationError: req.tls && req.tls.authorizationError
	};
}

function serializeError(err) {
	if (!err)
		return undefined;
	return {
		name: err.name,
		code: err.code,
		message: err.message,
		details: err.details,
		stack: err.stack,
		cause: serializeError(err.cause)
	};
}

function logHttpRequestReceived(req) {
	console.log('[dm] request received', buildHttpContext(req));
}

function logHttpResponseSent(req, statusCode, payload) {
	console.log('[dm] response sent', {
		...buildHttpContext(req),
		statusCode: statusCode,
		payload: payload
	});
}

function logHttpRequestError(req, err) {
	console.error('[dm] request failed', {
		...buildHttpContext(req),
		error: serializeError(err)
	});
}

function logError(label, err, context) {
	console.error('[dm] error', {
		label: label,
		context: context,
		error: serializeError(err)
	});
}

module.exports = {
	logHttpRequestReceived,
	logHttpResponseSent,
	logHttpRequestError,
	logError
};