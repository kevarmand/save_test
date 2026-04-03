const AppError = require('../errors/AppError');
const ERROR_CODES = require('../errors/errorCodes');
const dmClient = require('../clients/dm.client');
const notificationsClient = require('../clients/notifications.client');

async function dispatch(frameType, userId, command) {
	if (frameType === 'dm.send') {
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
	if (frameType === 'dm.conversations.list') {
		return {
			type: 'dm.conversations.list.ok',
			data: await dmClient.listConversations({
				userId: userId,
				limit: command.limit,
				cursor: command.cursor
			})
		};
	}
	if (frameType === 'dm.messages.list') {
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
	if (frameType === 'dm.read') {
		return {
			type: 'dm.read.ok',
			data: await dmClient.markConversationRead({
				userId: userId,
				otherUserId: command.otherUserId,
				lastReadMessageId: command.lastReadMessageId
			})
		};
	}
	if (frameType === 'notifications.list') {
		return {
			type: 'notifications.list.ok',
			data: await notificationsClient.listNotifications({
				userId: userId,
				limit: command.limit,
				cursor: command.cursor
			})
		};
	}
	if (frameType === 'notifications.read') {
		return {
			type: 'notifications.read.ok',
			data: await notificationsClient.markNotificationsRead({
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