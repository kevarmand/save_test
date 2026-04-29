const crypto = require('crypto');

function uuidv7() {
	const ts = Date.now().toString(16).padStart(12, '0').slice(-12);
	const rand = crypto.randomBytes(10).toString('hex');
	const variant = (8 + (parseInt(rand[3], 16) % 4)).toString(16);

	return (
		ts.slice(0, 8) + '-' +
		ts.slice(8, 12) + '-' +
		'7' + rand.slice(0, 3) + '-' +
		variant + rand.slice(4, 7) + '-' +
		rand.slice(7, 19)
	);
}

function getByPath(obj, path) {
	let current;

	current = obj;
	for (const key of path) {
		if (!current || typeof current !== 'object')
			return undefined;
		current = current[key];
	}
	return current;
}

function findFirst(obj, paths) {
	for (const path of paths) {
		const value = getByPath(obj, path);

		if (value !== undefined && value !== null)
			return value;
	}
	return undefined;
}

function buildDmSend(otherUserId, content) {
	return {
		type: 'dm.send',
		otherUserId,
		content,
		clientMsgId: uuidv7()
	};
}

function buildDmConversationsList(limit, cursor) {
	const frame = {
		type: 'dm.conversations.list',
		limit: limit || 30
	};

	if (cursor)
		frame.cursor = cursor;
	return frame;
}

function buildDmMessagesList(otherUserId, limit, beforeMessageId) {
	const frame = {
		type: 'dm.messages.list',
		otherUserId,
		limit: limit || 30
	};

	if (beforeMessageId)
		frame.beforeMessageId = beforeMessageId;
	return frame;
}

function buildDmRead(otherUserId, messageId) {
	return {
		type: 'dm.read',
		otherUserId,
		messageId
	};
}

function buildNotificationsList(limit, cursor) {
	const frame = {
		type: 'notifications.list',
		limit: limit || 30
	};

	if (cursor)
		frame.cursor = cursor;
	return frame;
}

function buildNotificationsRead(notificationIds) {
	return {
		type: 'notifications.read',
		notificationIds
	};
}

function buildNotificationsDelete(notificationIds) {
	return {
		type: 'notifications.delete',
		notificationIds
	};
}

function extractData(message) {
	return message.data || {};
}

function extractMessageId(message) {
	return findFirst(message, [
		['data', 'messageId'],
		['data', 'message', 'messageId'],
		['messageId'],
		['message', 'messageId']
	]);
}

function extractMessages(message) {
	const value = findFirst(message, [
		['data', 'messages'],
		['messages']
	]);

	if (Array.isArray(value))
		return value;
	return [];
}

function extractPage(message) {
	return findFirst(message, [
		['data', 'page'],
		['page']
	]) || {};
}

function extractNotifications(message) {
	const value = findFirst(message, [
		['data', 'notifications'],
		['notifications']
	]);

	if (Array.isArray(value))
		return value;
	return [];
}

function extractNotificationId(notification) {
	return findFirst(notification, [
		['notificationId'],
		['id']
	]);
}

function isDmPushWithContent(content) {
	return (message) => {
		const pushContent = findFirst(message, [
			['data', 'message', 'content'],
			['message', 'content']
		]);

		return message.type === 'dm.message.new' && pushContent === content;
	};
}

module.exports = {
	uuidv7,
	buildDmSend,
	buildDmConversationsList,
	buildDmMessagesList,
	buildDmRead,
	buildNotificationsList,
	buildNotificationsRead,
	buildNotificationsDelete,
	extractData,
	extractMessageId,
	extractMessages,
	extractPage,
	extractNotifications,
	extractNotificationId,
	isDmPushWithContent
};