const {
	validateCreateMessage,
	validateListMessages,
	validateMarkConversationRead,
	validateListConversations
} = require('../validation/dm.validation');
const dmService = require('../services/dm.service');

function buildLegacyCreateMessageCommand(req) {
	return {
		senderId: req.header('X-User-Id'),
		otherUserId: req.body.targetUserId,
		content: req.body.content,
		clientMessageId: req.body.clientMsgId
	};
}

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
		senderId: req.header('X-User-Id')
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

function buildListConversationsResponse(conversations) {
	return {
		conversations: conversations.map(buildConversationResponse)
	};
}

async function createMessageLegacy(req, res, next) {
	let command;
	let message;

	try {
		command = validateCreateMessage(buildLegacyCreateMessageCommand(req));
		message = await dmService.createMessage(command);
		return res.status(201).json(buildCreateMessageResponse(message));
	}
	catch (err) {
		return next(err);
	}
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
	let conversations;

	try {
		command = validateListConversations(buildListConversationsCommand(req));
		conversations = await dmService.listConversations(command);
		return res.status(200).json(buildListConversationsResponse(conversations));
	}
	catch (err) {
		return next(err);
	}
}

module.exports = {
	createMessageLegacy,
	createMessageByUser,
	listMessagesByUser,
	markConversationReadByUser,
	listConversations
};