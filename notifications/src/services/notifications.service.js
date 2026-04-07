const notificationsRepository = require('../repositories/notifications.repository');
const realtimeClient = require('../clients/realtime.client');

async function createDmMessageNotification(command) {
	let result;

	result = await notificationsRepository.createDmMessageNotification({
		recipientUserId: command.recipientUserId,
		senderUserId: command.senderUserId,
		messageId: command.messageId,
		content: command.content,
		clientMessageId: command.clientMessageId,
		createdAt: command.createdAt
	});
	if (result.created) {
		await realtimeClient.pushNotificationCreated(result.notification);
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

async function markDmConversationRead(command) {
	return notificationsRepository.markDmConversationRead({
		readerUserId: command.readerUserId,
		otherUserId: command.otherUserId,
		readUpToMessageId: command.readUpToMessageId
	});
}

module.exports = {
	createDmMessageNotification,
	listNotifications,
	markNotificationsRead,
	markDmConversationRead
};