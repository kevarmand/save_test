const {
	validateCreateMessage,
	validateListMessages,
	validateMarkConversationRead,
	validateListConversations
} = require('../validation/dm.validation');
const dmService = require('../services/dm.service');

function buildCreateMessageCommand(req) {
	return {
		senderId: req.header('X-User-Id'),
		otherUserId: req.params.otherUserId,
		content: req.body.content,
		clientMessageId: req.body.clientMsgId
	};
}

function buildListMessagesCommand(req) {
	return {
		senderId: req.header('X-User-Id'),
		otherUserId: req.params.otherUserId,
		limit: req.query.limit,
		beforeMessageId: req.query.beforeMessageId
	};
}

function buildMarkConversationReadCommand(req) {
	return {
		senderId: req.header('X-User-Id'),
		otherUserId: req.params.otherUserId,
		messageId: req.body.messageId
	};
}

function buildListConversationsCommand(req) {
	return {
		senderId: req.header('X-User-Id'),
		limit: req.query.limit,
		cursor: req.query.cursor
	};
}

function mapMessageResponse(message) {
	return {
		messageId: message.messageId,
		senderId: message.senderId,
		content: message.content,
		clientMsgId: message.clientMessageId,
		createdAt: message.createdAt
	};
}

function buildCreateMessageResponse(message) {
	return {
		messageId: message.messageId,
		otherUserId: message.otherUserId,
		senderId: message.senderId,
		content: message.content,
		clientMsgId: message.clientMessageId,
		createdAt: message.createdAt
	};
}

function buildListMessagesResponse(result) {
	return {
		otherUserId: result.otherUserId,
		messages: result.messages.map(mapMessageResponse),
		page: {
			limit: result.limit,
			hasMore: result.hasMore,
			nextBeforeMessageId: result.nextBeforeMessageId
		}
	};
}

function buildMarkConversationReadResponse(result) {
	return {
		otherUserId: result.otherUserId,
		readUpToMessageId: result.readUpToMessageId
	};
}

function buildConversationResponse(conversation) {
	return {
		otherUserId: conversation.otherUserId,
		lastReadMessageId: conversation.lastReadMessageId,
		hasUnread: conversation.hasUnread,
		lastMessage: conversation.lastMessage
			? mapMessageResponse(conversation.lastMessage)
			: null
	};
}

function buildListConversationsResponse(result) {
	return {
		conversations: result.conversations.map(buildConversationResponse),
		page: {
			limit: result.limit,
			hasMore: result.hasMore,
			nextCursor: result.nextCursor
		}
	};
}

async function createMessageByUser(req, res, next) {
	let command;
	let message;

	try {
		command = validateCreateMessage(buildCreateMessageCommand(req));
		message = await dmService.createMessage(command);
		return res.status(201).json(buildCreateMessageResponse(message));
	}
	catch (err) {
		return next(err);
	}
}

async function listMessagesByUser(req, res, next) {
	let command;
	let result;

	try {
		command = validateListMessages(buildListMessagesCommand(req));
		result = await dmService.listMessages(command);
		return res.status(200).json(buildListMessagesResponse(result));
	}
	catch (err) {
		return next(err);
	}
}

async function markConversationReadByUser(req, res, next) {
	let command;
	let result;

	try {
		command = validateMarkConversationRead(
			buildMarkConversationReadCommand(req)
		);
		result = await dmService.markConversationRead(command);
		return res.status(200).json(buildMarkConversationReadResponse(result));
	}
	catch (err) {
		return next(err);
	}
}

async function listConversations(req, res, next) {
	let command;
	let result;

	try {
		command = validateListConversations(buildListConversationsCommand(req));
		result = await dmService.listConversations(command);
		return res.status(200).json(buildListConversationsResponse(result));
	}
	catch (err) {
		return next(err);
	}
}

module.exports = {
	createMessageByUser,
	listMessagesByUser,
	markConversationReadByUser,
	listConversations
};