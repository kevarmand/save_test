const AppError = require('../errors/AppError');
const ERROR_CODES = require('../errors/errorCodes');
const {verifyAuthToken} = require('../services/auth.service');
const dispatchService = require('../services/dispatch.service');
const registryService = require('../services/registry.service');
const {
	validateIncomingFrame,
	validateAuthFrame,
	validateAuthenticatedFrame
} = require('../validation/ws.validation');
const {sendJson, sendError} = require('./send');
const {logWsFrameReceived} = require('../log/logger');

function extractRequestId(frame) {
	if (!frame)
		return undefined;
	if (typeof frame.requestId !== 'string' || frame.requestId.trim() === '')
		return undefined;
	return frame.requestId;
}

async function handleAuthFrame(ws, frame) {
	let command;
	let session;

	command = validateAuthFrame(frame);
	session = verifyAuthToken(command.token);
	registryService.bindSocketToUser(session.userId, ws);
	ws.authenticated = true;
	ws.userId = session.userId;
	sendJson(ws, {
		type: 'auth.ok',
		userId: session.userId
	});
}

async function handleAuthenticatedFrame(ws, frame) {
	let command;
	let responseFrame;

	command = validateAuthenticatedFrame(frame);
	responseFrame = await dispatchService.dispatch(frame.type, ws.userId, command);
	if (command.requestId !== undefined)
		responseFrame.requestId = command.requestId;
	sendJson(ws, responseFrame);
}

async function handleSocketMessage(ws, rawData) {
	let frame;
	let requestId;

	try {
		frame = validateIncomingFrame(rawData);
		logWsFrameReceived(ws, frame);
	}
	catch (err) {
		sendError(ws, err);
		return;
	}
	requestId = extractRequestId(frame);
	if (ws.authenticated !== true) {
		if (frame.type !== 'auth') {
			sendError(
				ws,
				new AppError(ERROR_CODES.UNAUTHORIZED, 'auth required'),
				requestId
			);
			ws.close(1008, 'auth required');
			return;
		}
		try {
			await handleAuthFrame(ws, frame);
		}
		catch (err) {
			sendError(ws, err, requestId);
			ws.close(1008, 'unauthorized');
		}
		return;
	}
	if (frame.type === 'auth') {
		sendError(
			ws,
			new AppError(
				ERROR_CODES.INVALID_ARGUMENT,
				'socket already authenticated'
			),
			requestId
		);
		return;
	}
	try {
		await handleAuthenticatedFrame(ws, frame);
	}
	catch (err) {
		sendError(ws, err, requestId);
	}
}

module.exports = {
	handleSocketMessage
};