const AppError = require('../errors/AppError');
const ERROR_CODES = require('../errors/errorCodes');
const env = require('../config/env');
const agent = require('./https.agent');
const request = require('./https.request');

function buildPublicNotification(notification) {
	return {
		notificationId: notification.notificationId,
		type: notification.type,
		actorUserId: notification.actorUserId,
		readAt: notification.readAt,
		createdAt: notification.createdAt,
		payload: notification.payload
	};
}

function buildPushPayload(notification) {
	return {
		userIds: [notification.userId],
		frame: {
			type: 'notifications.created',
			data: {
				notification: buildPublicNotification(notification)
			}
		}
	};
}

async function pushNotificationCreated(notification) {
	let body;
	let response;

	body = JSON.stringify(buildPushPayload(notification));
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
					operation: 'pushNotificationCreated',
					targetUserId: notification.userId,
					notificationId: notification.notificationId
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
					operation: 'pushNotificationCreated',
					targetUserId: notification.userId,
					notificationId: notification.notificationId,
					upstreamStatusCode: response.statusCode,
					responseBody: response.body
				}
			}
		);
	}
}

module.exports = {
	pushNotificationCreated
};