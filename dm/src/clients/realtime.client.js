const AppError = require('../errors/AppError');
const ERROR_CODES = require('../errors/errorCodes');
const env = require('../config/env');
const agent = require('./https.agent');
const request = require('./https.request');

function buildPushPayload(message) {
	return {
		userIds: [message.otherUserId],
		frame: {
			type: 'dm.message.new',
			data: {
				otherUserId: message.senderId,
				message: {
					messageId: message.messageId,
					senderId: message.senderId,
					content: message.content,
					clientMsgId: message.clientMessageId,
					createdAt: message.createdAt
				}
			}
		}
	};
}

async function pushDmMessage(message) {
	let body;
	let response;

	body = JSON.stringify(buildPushPayload(message));
	try {
		response = await request({
			protocol: 'https:',
			hostname: env.clients.realtime.host,
			port: env.clients.realtime.port,
			path: '/internal/push',
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
			'realtime service error',
			{
				cause: err,
				details: {
					service: 'realtime',
					operation: 'pushDmMessage',
					targetUserId: message.otherUserId,
					messageId: message.messageId
				}
			}
		);
	}
	if (response.statusCode < 200 || response.statusCode >= 300) {
		throw new AppError(
			ERROR_CODES.INTERNAL_ERROR,
			'realtime service error',
			{
				details: {
					service: 'realtime',
					operation: 'pushDmMessage',
					targetUserId: message.otherUserId,
					messageId: message.messageId,
					upstreamStatusCode: response.statusCode,
					responseBody: response.body
				}
			}
		);
	}
}

module.exports = {
	pushDmMessage
};