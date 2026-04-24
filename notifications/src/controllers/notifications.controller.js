const {
	validateListNotifications,
	validateMarkNotificationsRead,
	validateDeleteNotifications
} = require('../validation/notifications.validation');
const notificationsService = require('../services/notifications.service');

function buildListNotificationsCommand(req) {
	return {
		userId: req.header('X-User-Id'),
		limit: req.query.limit,
		cursor: req.query.cursor
	};
}

function buildMarkNotificationsReadCommand(req) {
	return {
		userId: req.header('X-User-Id'),
		notificationIds: req.body.notificationIds
	};
}

function buildDeleteNotificationsCommand(req) {
	return {
		userId: req.header('X-User-Id'),
		notificationIds: req.body.notificationIds
	};
}

function mapNotificationResponse(notification) {
	return {
		notificationId: notification.notificationId,
		type: notification.type,
		actorUserId: notification.actorUserId,
		readAt: notification.readAt,
		createdAt: notification.createdAt,
		payload: notification.payload
	};
}

function buildListNotificationsResponse(result) {
	return {
		notifications: result.notifications.map(mapNotificationResponse),
		page: {
			limit: result.limit,
			hasMore: result.hasMore,
			nextCursor: result.nextCursor
		}
	};
}

function buildMarkNotificationsReadResponse(result) {
	return {
		updatedCount: result.updatedCount
	};
}

function buildDeleteNotificationsResponse(result) {
	return {
		deletedCount: result.deletedCount
	};
}

async function listNotifications(req, res, next) {
	let command;
	let result;

	try {
		command = validateListNotifications(
			buildListNotificationsCommand(req)
		);
		result = await notificationsService.listNotifications(command);
		return res.status(200).json(buildListNotificationsResponse(result));
	}
	catch (err) {
		return next(err);
	}
}

async function markNotificationsRead(req, res, next) {
	let command;
	let result;

	try {
		command = validateMarkNotificationsRead(
			buildMarkNotificationsReadCommand(req)
		);
		result = await notificationsService.markNotificationsRead(command);
		return res.status(200).json(
			buildMarkNotificationsReadResponse(result)
		);
	}
	catch (err) {
		return next(err);
	}
}

async function deleteNotifications(req, res, next) {
	let command;
	let result;

	try {
		command = validateDeleteNotifications(
			buildDeleteNotificationsCommand(req)
		);
		result = await notificationsService.deleteNotifications(command);
		return res.status(200).json(buildDeleteNotificationsResponse(result));
	}
	catch (err) {
		return next(err);
	}
}

module.exports = {
	listNotifications,
	markNotificationsRead,
	deleteNotifications
};