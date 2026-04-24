const AppError = require('../errors/AppError');
const ERROR_CODES = require('../errors/errorCodes');
const dmClient = require('../clients/dm.client');
const notificationsClient = require('../clients/notifications.client');

async function dispatch(userId, command) {
	if (command.type === 'dm.send') {
		return {
			type: 'dm.send.ok',
			data: await dmClient.sendMessage({
				senderId: userId,
				otherUserId: command.otherUserId,
				content: command.content,
				clientMessageId: command.clientMessageId
			})
		};
	}
	if (command.type === 'dm.conversations.list') {
		return {
			type: 'dm.conversations.list.ok',
			data: await dmClient.listConversations({
				userId: userId,
				limit: command.limit,
				cursor: command.cursor
			})
		};
	}
	if (command.type === 'dm.messages.list') {
		return {
			type: 'dm.messages.list.ok',
			data: await dmClient.listMessages({
				userId: userId,
				otherUserId: command.otherUserId,
				limit: command.limit,
				beforeMessageId: command.beforeMessageId
			})
		};
	}
	if (command.type === 'dm.read') {
		return {
			type: 'dm.read.ok',
			data: await dmClient.markConversationRead({
				userId: userId,
				otherUserId: command.otherUserId,
				messageId: command.messageId
			})
		};
	}
	if (command.type === 'notifications.list') {
		return {
			type: 'notifications.list.ok',
			data: await notificationsClient.listNotifications({
				userId: userId,
				limit: command.limit,
				cursor: command.cursor
			})
		};
	}
	if (command.type === 'notifications.read') {
		return {
			type: 'notifications.read.ok',
			data: await notificationsClient.markNotificationsRead({
				userId: userId,
				notificationIds: command.notificationIds
			})
		};
	}
	if (command.type === 'notifications.delete') {
		return {
			type: 'notifications.delete.ok',
			data: await notificationsClient.deleteNotifications({
				userId: userId,
				notificationIds: command.notificationIds
			})
		};
	}
	throw new AppError(ERROR_CODES.INVALID_ARGUMENT, 'unknown frame type');
}

module.exports = {
	dispatch
};