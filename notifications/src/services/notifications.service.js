const notificationsRepository = require('../repositories/notifications.repository');
const realtimeClient = require('../clients/realtime.client');

function logSideEffectFailure(operation, err, details) {
	console.error('[notifications] side effect failed', {
		operation: operation,
		code: err && err.code,
		message: err && err.message,
		details: details
	});
}

async function runBestEffort(operation, details, fn) {
	try {
		await fn();
	}
	catch (err) {
		logSideEffectFailure(operation, err, details);
	}
}

async function createCommentNotification(command) {
	let result;

	result = await notificationsRepository.createCommentNotification({
		action: command.action,
		commentId: command.commentId,
		postId: command.postId,
		postOwnerId: command.postOwnerId,
		actorUserId: command.actorUserId
	});
	if (result.created === true) {
		await runBestEffort(
			'pushNotificationCreated',
			{
				targetUserId: result.notification.userId,
				notificationId: result.notification.notificationId
			},
			() => realtimeClient.pushNotificationCreated(result.notification)
		);
	}
	return result;
}

async function listNotifications(command) {
	return notificationsRepository.listNotifications({
		userId: command.userId,
		limit: command.limit,
		cursor: command.cursor
	});
}

async function markNotificationsRead(command) {
	return notificationsRepository.markNotificationsRead({
		userId: command.userId,
		notificationIds: command.notificationIds
	});
}

async function deleteNotifications(command) {
	return notificationsRepository.deleteNotifications({
		userId: command.userId,
		notificationIds: command.notificationIds
	});
}

module.exports = {
	createCommentNotification,
	listNotifications,
	markNotificationsRead,
	deleteNotifications
};