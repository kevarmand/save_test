const {WebSocketServer} = require('ws');
const env = require('../config/env');
const AppError = require('../errors/AppError');
const ERROR_CODES = require('../errors/errorCodes');
const sessionService = require('../services/session.service');
const {handleSocketMessage} = require('./message.handler');
const {sendError} = require('./send');

function getRequestPath(url) {
	return new URL(url, 'https://realtime.local').pathname;
}

function rejectUpgrade(socket, statusCode, reason) {
	socket.write(
		'HTTP/1.1 ' + statusCode + ' ' + reason + '\r\n'
		+ 'Connection: close\r\n'
		+ '\r\n'
	);
	socket.destroy();
}

function installSocketLifecycle(ws) {
	sessionService.addSocket(ws);
	ws.isAlive = true;
	ws.authenticated = false;
	ws.userId = undefined;
	ws.on('pong', () => {
		ws.isAlive = true;
	});
	ws.on('message', (data, isBinary) => {
		if (isBinary) {
			sendError(
				ws,
				new AppError(
					ERROR_CODES.INVALID_ARGUMENT,
					'binary frames are not supported'
				)
			);
			ws.close(1003, 'binary not supported');
			return;
		}
		handleSocketMessage(ws, data).catch((err) => {
			sendError(ws, err);
		});
	});
	ws.on('close', () => {
		sessionService.removeSocket(ws);
	});
	ws.on('error', () => {
	});
	setTimeout(() => {
		if (ws.authenticated !== true)
			ws.close(1008, 'auth timeout');
	}, env.ws.authTimeoutMs);
}

function startHeartbeat() {
	setInterval(() => {
		sessionService.forEachSocket((ws) => {
			if (ws.isAlive === false) {
				ws.terminate();
				return;
			}
			ws.isAlive = false;
			ws.ping();
		});
	}, env.ws.heartbeatIntervalMs);
}

function attachWebSocketServer(server) {
	const wss = new WebSocketServer({
		noServer: true,
		maxPayload: env.ws.maxPayloadBytes,
		perMessageDeflate: false
	});

	server.on('upgrade', (request, socket, head) => {
		if (getRequestPath(request.url) !== env.ws.path) {
			rejectUpgrade(socket, 404, 'Not Found');
			return;
		}
		wss.handleUpgrade(request, socket, head, (ws) => {
			wss.emit('connection', ws, request);
		});
	});
	wss.on('connection', (ws) => {
		installSocketLifecycle(ws);
	});
	startHeartbeat();
	return wss;
}

module.exports = attachWebSocketServer;