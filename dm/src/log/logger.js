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

module.exports = {
	logHttpRequestReceived,
	logHttpResponseSent
};