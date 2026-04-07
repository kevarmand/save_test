const AppError = require('../errors/AppError');
const ERROR_CODES = require('../errors/errorCodes');
const env = require('../config/env');
const agent = require('./https.agent');
const request = require('./https.request');

function buildMessageCreatedPayload(message) {
	return {
		recipientUserId: message.otherUserId,
		senderUserId: message.senderId,
		messageId: message.messageId,
		content: message.content,
		clientMsgId: message.clientMessageId,
		createdAt: message.createdAt
	};
}

function buildReadPayload(data) {
	return {
		readerUserId: data.senderId,
		otherUserId: data.otherUserId,
		readUpToMessageId: data.readUpToMessageId
	};
}

async function postJson(path, payload, operation, details) {
	let body;
	let response;

	body = JSON.stringify(payload);
	try {
		response = await request({
			protocol: 'https:',
			hostname: env.clients.notification.host,
			port: env.clients.notification.port,
			path: path,
			method: 'POST',
			agent: agent,
			headers: {
				'Content-Type': 'application/json',
				'Content-Length': Buffer.byteLength(body)
			},
			body: body
		});
	}
	catch (err) {
		throw new AppError(
			ERROR_CODES.INTERNAL_ERROR,
			'notification service error',
			{
				cause: err,
				details: {
					service: 'notification',
					operation: operation,
					...details
				}
			}
		);
	}
	if (response.statusCode < 200 || response.statusCode >= 300) {
		throw new AppError(
			ERROR_CODES.INTERNAL_ERROR,
			'notification service error',
			{
				details: {
					service: 'notification',
					operation: operation,
					upstreamStatusCode: response.statusCode,
					responseBody: response.body,
					...details
				}
			}
		);
	}
}

async function createDmMessageNotification(message) {
	return postJson(
		'/internal/dm/message-created',
		buildMessageCreatedPayload(message),
		'createDmMessageNotification',
		{
			recipientUserId: message.otherUserId,
			senderUserId: message.senderId,
			messageId: message.messageId
		}
	);
}

async function markDmConversationRead(data) {
	return postJson(
		'/internal/dm/read',
		buildReadPayload(data),
		'markDmConversationRead',
		{
			readerUserId: data.senderId,
			otherUserId: data.otherUserId,
			readUpToMessageId: data.readUpToMessageId
		}
	);
}

module.exports = {
	createDmMessageNotification,
	markDmConversationRead
};