const prisma = require('../db/prisma');

const DM_MESSAGE_RECEIVED = 'dm.message.received';

function buildDmMessagePayload(data) {
	return {
		otherUserId: data.senderUserId,
		message: {
			messageId: data.messageId,
			senderId: data.senderUserId,
			content: data.content,
			clientMsgId: data.clientMessageId,
			createdAt: data.createdAt
		}
	};
}

function mapNotification(notification) {
	return {
		notificationId: notification.id,
		userId: notification.userId,
		type: notification.type,
		actorUserId: notification.actorUserId,
		readAt: notification.readAt,
		createdAt: notification.createdAt,
		payload: notification.payload
	};
}

function isUniqueConstraintError(err) {
	return err && err.code === 'P2002';
}

async function findExistingDmMessageNotification(data) {
	return prisma.notification.findFirst({
		where: {
			userId: data.recipientUserId,
			type: DM_MESSAGE_RECEIVED,
			messageId: data.messageId
		}
	});
}

async function createDmMessageNotification(data) {
	let notification;

	try {
		notification = await prisma.notification.create({
			data: {
				userId: data.recipientUserId,
				type: DM_MESSAGE_RECEIVED,
				actorUserId: data.senderUserId,
				conversationUserId: data.senderUserId,
				messageId: data.messageId,
				payload: buildDmMessagePayload(data)
			}
		});
		return {
			created: true,
			notification: mapNotification(notification)
		};
	}
	catch (err) {
		if (!isUniqueConstraintError(err))
			throw err;
		notification = await findExistingDmMessageNotification(data);
		if (notification) {
			return {
				created: false,
				notification: mapNotification(notification)
			};
		}
		throw err;
	}
}

async function listNotifications(data) {
	let notifications;
	let hasMore;
	let nextCursor;

	notifications = await prisma.notification.findMany({
		where: {
			userId: data.userId,
			...(data.cursor
				? {
					id: {
						lt: data.cursor
					}
				}
				: {})
		},
		orderBy: {
			id: 'desc'
		},
		take: data.limit + 1
	});
	hasMore = notifications.length > data.limit;
	if (hasMore)
		notifications.pop();
	nextCursor = hasMore && notifications.length > 0
		? notifications[notifications.length - 1].id
		: null;
	return {
		notifications: notifications.map(mapNotification),
		limit: data.limit,
		hasMore: hasMore,
		nextCursor: nextCursor
	};
}

async function markNotificationsRead(data) {
	const readAt = new Date();
	const result = await prisma.notification.updateMany({
		where: {
			userId: data.userId,
			id: {
				in: data.notificationIds
			},
			readAt: null
		},
		data: {
			readAt: readAt
		}
	});

	return {
		markedCount: result.count
	};
}

async function markDmConversationRead(data) {
	const readAt = new Date();
	const result = await prisma.notification.updateMany({
		where: {
			userId: data.readerUserId,
			type: DM_MESSAGE_RECEIVED,
			conversationUserId: data.otherUserId,
			messageId: {
				lte: data.readUpToMessageId
			},
			readAt: null
		},
		data: {
			readAt: readAt
		}
	});

	return {
		readerUserId: data.readerUserId,
		otherUserId: data.otherUserId,
		readUpToMessageId: data.readUpToMessageId,
		markedCount: result.count
	};
}

module.exports = {
	createDmMessageNotification,
	listNotifications,
	markNotificationsRead,
	markDmConversationRead
};