const prisma = require('../db/prisma');

function orderUsers(senderId, recipientId) {
	if (senderId < recipientId) {
		return {
			userLowId: senderId,
			userHighId: recipientId
		};
	}
	return {
		userLowId: recipientId,
		userHighId: senderId
	};
}

function mapMessage(message) {
	return {
		messageId: message.id,
		conversationId: message.conversationId,
		senderId: message.authorId,
		recipientId: message.conversation.userLowId === message.authorId
			? message.conversation.userHighId
			: message.conversation.userLowId,
		content: message.content,
		clientMessageId: message.clientMessageId,
		createdAt: message.createdAt
	};
}

async function createMessage(data) {
	const users = orderUsers(data.senderId, data.recipientId);

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
		try {
			message = await tx.message.create({
				data: {
					conversationId: conversation.id,
					authorId: data.senderId,
					content: data.content,
					clientMessageId: data.clientMessageId
				},
				include: {
					conversation: true
				}
			});
			return mapMessage(message);
		}
		catch (err) {
			if (err.code === 'P2002') {
				message = await tx.message.findUnique({
					where: {
						conversationId_authorId_clientMessageId: {
							conversationId: conversation.id,
							authorId: data.senderId,
							clientMessageId: data.clientMessageId
						}
					},
					include: {
						conversation: true
					}
				});
				if (message)
					return mapMessage(message);
			}
			throw err;
		}
	});
}

module.exports = {
	createMessage
};