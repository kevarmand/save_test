const AppError = require('../errors/AppError');
const ERROR_CODES = require('../errors/errorCodes');
const env = require('../config/env');
const agent = require('./https.agent');
const request = require('./https.request');

function parseResponseBody(response) {
	if (!response.body)
		return null;
	try {
		return JSON.parse(response.body);
	}
	catch (err) {
		throw new AppError(
			ERROR_CODES.INTERNAL_ERROR,
			'dm service returned invalid JSON',
			{
				cause: err,
				details: {
					service: 'dm'
				}
			}
		);
	}
}

async function createMessage(command) {
	let response;
	let payload;

	try {
		response = await request({
			protocol: 'https:',
			hostname: env.clients.dm.host,
			port: env.clients.dm.port,
			path: '/dm/users/' + command.otherUserId + '/messages',
			method: 'POST',
			agent: agent,
			headers: {
				'Content-Type': 'application/json',
				'X-User-Id': command.senderId
			},
			body: JSON.stringify({
				content: command.content,
				clientMsgId: command.clientMessageId
			})
		});
	}
	catch (err) {
		throw new AppError(
			ERROR_CODES.INTERNAL_ERROR,
			'dm service error',
			{
				cause: err,
				details: {
					service: 'dm',
					operation: 'createMessage',
					senderId: command.senderId,
					otherUserId: command.otherUserId
				}
			}
		);
	}
	payload = parseResponseBody(response);
	if (response.statusCode >= 200 && response.statusCode < 300)
		return payload;
	throw new AppError(
		payload && payload.code ? payload.code : ERROR_CODES.INTERNAL_ERROR,
		payload && payload.message ? payload.message : 'dm service error',
		{
			details: {
				service: 'dm',
				operation: 'createMessage',
				senderId: command.senderId,
				otherUserId: command.otherUserId,
				upstreamStatusCode: response.statusCode
			}
		}
	);
}

module.exports = {
	createMessage
};