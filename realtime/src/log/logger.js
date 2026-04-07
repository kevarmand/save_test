function getHttpCallerCommonName(req) {
	const certificate = req.socket && req.socket.getPeerCertificate
		? req.socket.getPeerCertificate()
		: undefined;

	if (!certificate || !certificate.subject)
		return undefined;
	return certificate.subject.CN;
}

function buildHttpContext(req) {
	return {
		method: req.method,
		path: req.originalUrl,
		caller: getHttpCallerCommonName(req),
		authorized: req.socket && req.socket.authorized,
		authorizationError: req.socket && req.socket.authorizationError
	};
}

function buildWsContext(ws) {
	return {
		userId: ws.userId,
		authenticated: ws.authenticated === true,
		remoteAddress: ws._socket && ws._socket.remoteAddress
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
	console.log('[realtime] request received', buildHttpContext(req));
}

function logHttpResponseSent(req, statusCode, payload) {
	console.log('[realtime] response sent', {
		...buildHttpContext(req),
		statusCode: statusCode,
		payload: payload
	});
}

function logHttpRequestError(req, err) {
	console.error('[realtime] request failed', {
		...buildHttpContext(req),
		error: serializeError(err)
	});
}

function logWsFrameReceived(ws, frame) {
	console.log('[realtime] ws frame received', {
		...buildWsContext(ws),
		frame: frame
	});
}

function logWsFrameSent(ws, frame) {
	console.log('[realtime] ws frame sent', {
		...buildWsContext(ws),
		frame: frame
	});
}

module.exports = {
	logHttpRequestReceived,
	logHttpResponseSent,
	logHttpRequestError,
	logWsFrameReceived,
	logWsFrameSent
};