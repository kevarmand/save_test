const WebSocket = require('ws');

function sendJson(ws, payload) {
	if (ws.readyState !== WebSocket.OPEN)
		return;
	ws.send(JSON.stringify(payload));
}

function sendError(ws, err, requestId) {
	const frame = {
		type: 'error',
		code: err && err.code ? err.code : 'INTERNAL_ERROR',
		message: err && err.message ? err.message : 'internal error'
	};

	if (requestId !== undefined)
		frame.requestId = requestId;
	sendJson(ws, frame);
}

module.exports = {
	sendJson,
	sendError
};