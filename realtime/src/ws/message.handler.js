const AppError = require('../errors/AppError');
const ERROR_CODES = require('../errors/errorCodes');
const chatService = require('../services/chat.service');
const sessionService = require('../services/session.service');
const {verifyWsToken} = require('../services/wsToken.service');
const {
	validateIncomingFrame,
	validateAuthFrame,
	validateChatSendFrame
} = require('../validation/ws.validation');
const {sendJson, sendError} = require('./send');

async function handleAuthFrame(ws, frame) {
	let command;
	let session;

	command = validateAuthFrame(frame);
	session = verifyWsToken(command.token);
	sessionService.authenticateSocket(session.userId, ws);
	ws.authenticated = true;
	ws.userId = session.userId;
	sendJson(ws, {
		type: 'auth.ok',
		userId: session.userId
	});
}

async function handleChatSendFrame(ws, frame) {
	let command;
	let message;
	const outboundSender = {};
	const outboundRecipient = {
		type: 'chat.message'
	};

	command = validateChatSendFrame(frame);
	message = await chatService.sendMessage({
		senderId: ws.userId,
		otherUserId: command.otherUserId,
		content: command.content,
		clientMessageId: command.clientMessageId
	});
	outboundSender.type = 'chat.sent';
	outboundSender.message = message;
	if (command.requestId !== undefined)
		outboundSender.requestId = command.requestId;
	outboundRecipient.message = message;
	sendJson(ws, outboundSender);
	sessionService.sendToUser(ws.userId, outboundRecipient, ws);
	sessionService.sendToUser(command.otherUserId, outboundRecipient);
}

async function handleSocketMessage(ws, rawData) {
	let frame;

	try {
		frame = validateIncomingFrame(rawData);
	}
	catch (err) {
		sendError(ws, err);
		return;
	}
	if (ws.authenticated !== true) {
		if (frame.type !== 'auth') {
			sendError(
				ws,
				new AppError(ERROR_CODES.UNAUTHORIZED, 'auth required')
			);
			ws.close(1008, 'auth required');
			return;
		}
		try {
			await handleAuthFrame(ws, frame);
		}
		catch (err) {
			sendError(ws, err);
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
			)
		);
		return;
	}
	if (frame.type === 'chat.send') {
		try {
			await handleChatSendFrame(ws, frame);
		}
		catch (err) {
			sendError(ws, err, frame.requestId);
		}
		return;
	}
	sendError(
		ws,
		new AppError(ERROR_CODES.INVALID_ARGUMENT, 'unknown frame type')
	);
}

module.exports = {
	handleSocketMessage
};