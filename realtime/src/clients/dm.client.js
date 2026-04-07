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
async function performRequest(options) {
	let response;
	let payload;

	try {
		response = await request({
			protocol: 'https:',
			hostname: env.clients.dm.host,
			port: env.clients.dm.port,
			path: options.path,
			method: options.method,
			agent: agent,
			headers: options.headers,
			body: options.body
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
					operation: options.operation
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
				operation: options.operation,
				upstreamStatusCode: response.statusCode
			}
		}
	);
}

function buildHeaders(userId, hasBody) {
	const headers = {
		'X-User-Id': userId
	};

	if (hasBody)
		headers['Content-Type'] = 'application/json';
	return headers;
}

function buildConversationQuery(command) {
	const params = new URLSearchParams();

	if (command.limit !== undefined)
		params.set('limit', String(command.limit));
	if (command.cursor !== undefined)
		params.set('cursor', command.cursor);
	if (params.size === 0)
		return '';
	return '?' + params.toString();
}

function buildMessagesQuery(command) {
	const params = new URLSearchParams();

	if (command.limit !== undefined)
		params.set('limit', String(command.limit));
	if (command.beforeMessageId !== undefined)
		params.set('beforeMessageId', command.beforeMessageId);
	if (params.size === 0)
		return '';
	return '?' + params.toString();
}

async function sendMessage(command) {
	return performRequest({
		operation: 'sendMessage',
		method: 'POST',
		path: '/dm/users/' + command.otherUserId + '/messages',
		headers: buildHeaders(command.senderId, true),
		body: JSON.stringify({
			content: command.content,
			clientMsgId: command.clientMessageId
		})
	});
}

async function listConversations(command) {
	return performRequest({
		operation: 'listConversations',
		method: 'GET',
		path: '/dm/conversations' + buildConversationQuery(command),
		headers: buildHeaders(command.userId, false)
	});
}

async function listMessages(command) {
	return performRequest({
		operation: 'listMessages',
		method: 'GET',
		path: '/dm/users/' + command.otherUserId + '/messages'
			+ buildMessagesQuery(command),
		headers: buildHeaders(command.userId, false)
	});
}

async function markConversationRead(command) {
	return performRequest({
		operation: 'markConversationRead',
		method: 'POST',
		path: '/dm/users/' + command.otherUserId + '/read',
		headers: buildHeaders(command.userId, true),
		body: JSON.stringify({
			messageId: command.messageId
		})
	});
}

module.exports = {
	sendMessage,
	listConversations,
	listMessages,
	markConversationRead
};