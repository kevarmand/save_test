const WebSocket = require('ws');
const {logWsFrameSent} = require('../log/logger');

function sendJson(ws, payload) {
	if (ws.readyState !== WebSocket.OPEN)
		return false;
	logWsFrameSent(ws, payload);
	ws.send(JSON.stringify(payload));
	return true;
}

function sendError(ws, err, requestId) {
	const frame = {
		type: 'error',
		code: err && err.code ? err.code : 'INTERNAL_ERROR',
		message: err && err.message ? err.message : 'internal error'
	};

	if (requestId !== undefined)
		frame.requestId = requestId;
	return sendJson(ws, frame);
}

module.exports = {
	sendJson,
	sendError
};