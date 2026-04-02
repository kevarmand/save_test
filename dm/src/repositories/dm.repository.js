const prisma = require('../db/prisma');

function orderUsers(senderId, otherUserId) {
	if (senderId < otherUserId) {
		return {
			userLowId: senderId,
			userHighId: otherUserId
		};
	}
	return {
		userLowId: otherUserId,
		userHighId: senderId
	};
}

function getOtherUserId(users, senderId) {
	if (senderId === users.userLowId)
		return users.userHighId;
	return users.userLowId;
}

function buildSenderReadUpdate(senderId, users, messageId) {
	if (senderId === users.userLowId) {
		return {
			lastReadLowMessageId: messageId
		};
	}
	return {
		lastReadHighMessageId: messageId
	};
}

function getSenderReadMessageId(conversation, senderId) {
	if (senderId === conversation.userLowId)
		return conversation.lastReadLowMessageId;
	return conversation.lastReadHighMessageId;
}

function mapMessage(message, users, senderId) {
	return {
		messageId: message.id,
		otherUserId: getOtherUserId(users, senderId),
		senderId: message.authorId,
		content: message.content,
		clientMessageId: message.clientMessageId,
		createdAt: message.createdAt
	};
}

function mapConversation(conversation, senderId) {
	const lastMessage = conversation.messages[0] || null;
	const users = {
		userLowId: conversation.userLowId,
		userHighId: conversation.userHighId
	};
	const lastReadMessageId = getSenderReadMessageId(conversation, senderId);

	return {
		otherUserId: getOtherUserId(users, senderId),
		lastReadMessageId: lastReadMessageId,
		hasUnread: !lastMessage
			? false
			: !lastReadMessageId || lastReadMessageId < lastMessage.id,
		lastMessage: lastMessage
			? mapMessage(lastMessage, users, senderId)
			: null
	};
}

function isUniqueConstraintError(err) {
	return err && err.code === 'P2002';
}

async function findConversationByUsers(users) {
	return prisma.conversation.findUnique({
		where: {
			userLowId_userHighId: {
				userLowId: users.userLowId,
				userHighId: users.userHighId
			}
		}
	});
}

async function findExistingMessage(data, users) {
	return prisma.message.findFirst({
		where: {
			authorId: data.senderId,
			clientMessageId: data.clientMessageId,
			conversation: {
				userLowId: users.userLowId,
				userHighId: users.userHighId
			}
		}
	});
}

async function createMessageInTransaction(data, users) {
	return prisma.$transaction(async (tx) => {
		let conversation;
		let message;

		conversation = await tx.conversation.upsert({
			where: {
				userLowId_userHighId: {
					userLowId: users.userLowId,
					userHighId: users.userHighId
				}
			},
			update: {},
			create: {
				userLowId: users.userLowId,
				userHighId: users.userHighId
			}
		});
		message = await tx.message.create({
			data: {
				conversationId: conversation.id,
				authorId: data.senderId,
				content: data.content,
				clientMessageId: data.clientMessageId
			}
		});
		await tx.conversation.update({
			where: {
				id: conversation.id
			},
			data: buildSenderReadUpdate(data.senderId, users, message.id)
		});
		return mapMessage(message, users, data.senderId);
	});
}

async function createMessage(data) {
	const users = orderUsers(data.senderId, data.otherUserId);

	try {
		return await createMessageInTransaction(data, users);
	}
	catch (err) {
		let message;

		if (!isUniqueConstraintError(err))
			throw err;
		message = await findExistingMessage(data, users);
		if (message)
			return mapMessage(message, users, data.senderId);
		throw err;
	}
}

async function listMessages(data) {
	const users = orderUsers(data.senderId, data.otherUserId);
	const conversation = await findConversationByUsers(users);
	let messages;
	let hasMore;
	let nextBeforeMessageId;

	if (!conversation) {
		return {
			otherUserId: data.otherUserId,
			messages: [],
			limit: data.limit,
			hasMore: false,
			nextBeforeMessageId: null
		};
	}
	if (data.beforeMessageId) {
		const beforeMessage = await prisma.message.findFirst({
			where: {
				id: data.beforeMessageId,
				conversationId: conversation.id
			},
			select: {
				id: true
			}
		});

		if (!beforeMessage) {
			return {
				error: 'before_message_not_found'
			};
		}
	}
	messages = await prisma.message.findMany({
		where: {
			conversationId: conversation.id,
			...(data.beforeMessageId
				? {
					id: {
						lt: data.beforeMessageId
					}
				}
				: {})
		},
		orderBy: {
			id: 'desc'
		},
		take: data.limit + 1
	});
	hasMore = messages.length > data.limit;
	if (hasMore)
		messages.pop();
	messages.reverse();
	nextBeforeMessageId = hasMore && messages.length > 0
		? messages[0].id
		: null;
	return {
		otherUserId: data.otherUserId,
		messages: messages.map((message) => {
			return mapMessage(message, users, data.senderId);
		}),
		limit: data.limit,
		hasMore: hasMore,
		nextBeforeMessageId: nextBeforeMessageId
	};
}

async function markConversationRead(data) {
	const users = orderUsers(data.senderId, data.otherUserId);
	const conversation = await findConversationByUsers(users);
	const currentReadMessageId = conversation
		? getSenderReadMessageId(conversation, data.senderId)
		: null;
	const readUpToMessageId = currentReadMessageId
		&& currentReadMessageId >= data.messageId
		? currentReadMessageId
		: data.messageId;

	if (!conversation) {
		return {
			error: 'conversation_not_found'
		};
	}
	const targetMessage = await prisma.message.findFirst({
		where: {
			id: data.messageId,
			conversationId: conversation.id
		},
		select: {
			id: true
		}
	});

	if (!targetMessage) {
		return {
			error: 'message_not_found'
		};
	}
	if (currentReadMessageId && currentReadMessageId >= targetMessage.id) {
		return {
			otherUserId: data.otherUserId,
			readUpToMessageId: currentReadMessageId
		};
	}
	await prisma.conversation.update({
		where: {
			id: conversation.id
		},
		data: buildSenderReadUpdate(data.senderId, users, readUpToMessageId)
	});
	return {
		otherUserId: data.otherUserId,
		readUpToMessageId: readUpToMessageId
	};
}

async function listConversations(senderId) {
	const conversations = await prisma.conversation.findMany({
		where: {
			OR: [
				{
					userLowId: senderId
				},
				{
					userHighId: senderId
				}
			]
		},
		include: {
			messages: {
				orderBy: {
					id: 'desc'
				},
				take: 1
			}
		}
	});

	return conversations
		.map((conversation) => {
			return mapConversation(conversation, senderId);
		})
		.sort((left, right) => {
			if (!left.lastMessage && !right.lastMessage)
				return 0;
			if (!left.lastMessage)
				return 1;
			if (!right.lastMessage)
				return -1;
			if (left.lastMessage.messageId < right.lastMessage.messageId)
				return 1;
			if (left.lastMessage.messageId > right.lastMessage.messageId)
				return -1;
			return 0;
		});
}

module.exports = {
	createMessage,
	listMessages,
	markConversationRead,
	listConversations
};