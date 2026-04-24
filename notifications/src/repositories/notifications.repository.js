const prisma = require('../db/prisma');

function buildNotificationTypeFromCommentAction(action) {
	return 'comment.' + action;
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

async function createCommentNotification(data) {
	let notification;

	if (data.actorUserId === data.postOwnerId) {
		return {
			created: false
		};
	}
	notification = await prisma.notification.create({
		data: {
			userId: data.postOwnerId,
			type: buildNotificationTypeFromCommentAction(data.action),
			actorUserId: data.actorUserId,
			payload: {
				postId: data.postId,
				commentId: data.commentId
			}
		}
	});
	return {
		created: true,
		notification: mapNotification(notification)
	};
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
	const now = new Date();
	const result = await prisma.notification.updateMany({
		where: {
			userId: data.userId,
			id: {
				in: data.notificationIds
			},
			readAt: null
		},
		data: {
			readAt: now
		}
	});

	return {
		updatedCount: result.count
	};
}

async function deleteNotifications(data) {
	const result = await prisma.notification.deleteMany({
		where: {
			userId: data.userId,
			id: {
				in: data.notificationIds
			}
		}
	});

	return {
		deletedCount: result.count
	};
}

module.exports = {
	createCommentNotification,
	listNotifications,
	markNotificationsRead,
	deleteNotifications
};