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
			'notifications service returned invalid JSON',
			{
				cause: err,
				details: {
					service: 'notifications'
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
			hostname: env.clients.notifications.host,
			port: env.clients.notifications.port,
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
			'notifications service error',
			{
				cause: err,
				details: {
					service: 'notifications',
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
		payload && payload.message ? payload.message : 'notifications service error',
		{
			details: {
				service: 'notifications',
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

function buildListQuery(command) {
	const params = new URLSearchParams();

	if (command.limit !== undefined)
		params.set('limit', String(command.limit));
	if (command.cursor !== undefined)
		params.set('cursor', command.cursor);
	if (params.size === 0)
		return '';
	return '?' + params.toString();
}

async function listNotifications(command) {
	return performRequest({
		operation: 'listNotifications',
		method: 'GET',
		path: '/notifications' + buildListQuery(command),
		headers: buildHeaders(command.userId, false)
	});
}

async function markNotificationsRead(command) {
	return performRequest({
		operation: 'markNotificationsRead',
		method: 'POST',
		path: '/notifications/read',
		headers: buildHeaders(command.userId, true),
		body: JSON.stringify({
			notificationIds: command.notificationIds
		})
	});
}

async function deleteNotifications(command) {
	return performRequest({
		operation: 'deleteNotifications',
		method: 'POST',
		path: '/notifications/delete',
		headers: buildHeaders(command.userId, true),
		body: JSON.stringify({
			notificationIds: command.notificationIds
		})
	});
}

module.exports = {
	listNotifications,
	markNotificationsRead,
	deleteNotifications
};