const {
	validateCreateDmMessageNotification,
	validateMarkDmConversationRead
} = require('../validation/internal.validation');
const notificationsService = require('../services/notifications.service');

function buildCreateDmMessageNotificationCommand(req) {
	return {
		recipientUserId: req.body.recipientUserId,
		senderUserId: req.body.senderUserId,
		messageId: req.body.messageId,
		content: req.body.content,
		clientMessageId: req.body.clientMsgId,
		createdAt: req.body.createdAt
	};
}

function buildMarkDmConversationReadCommand(req) {
	return {
		readerUserId: req.body.readerUserId,
		otherUserId: req.body.otherUserId,
		readUpToMessageId: req.body.readUpToMessageId
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

async function createDmMessageNotification(req, res, next) {
	let command;
	let result;

	try {
		command = validateCreateDmMessageNotification(
			buildCreateDmMessageNotificationCommand(req)
		);
		result = await notificationsService.createDmMessageNotification(command);
		return res.status(result.created ? 201 : 200).json({
			created: result.created,
			notification: mapNotificationResponse(result.notification)
		});
	}
	catch (err) {
		return next(err);
	}
}

async function markDmConversationRead(req, res, next) {
	let command;
	let result;

	try {
		command = validateMarkDmConversationRead(
			buildMarkDmConversationReadCommand(req)
		);
		result = await notificationsService.markDmConversationRead(command);
		return res.status(200).json(result);
	}
	catch (err) {
		return next(err);
	}
}

module.exports = {
	createDmMessageNotification,
	markDmConversationRead
};