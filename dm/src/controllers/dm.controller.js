const {validateCreateMessage} = require('../validation/dm.validation');
const dmService = require('../services/dm.service');

function buildCreateMessageCommand(req) {
	return {
		senderId: req.header('X-User-Id'),
		recipientId: req.body.targetUserId,
		content: req.body.content,
		clientMessageId: req.body.clientMsgId
	};
}

function buildCreateMessageResponse(message) {
	return {
		messageId: message.messageId,
		conversationId: message.conversationId,
		userId: message.senderId,
		content: message.content,
		clientMsgId: message.clientMessageId,
		createdAt: message.createdAt
	};
}

async function createMessage(req, res, next) {
	let command;
	let message;

	try {
		command = buildCreateMessageCommand(req);
		validateCreateMessage(command);
		message = await dmService.createMessage(command);
		return res.status(201).json(buildCreateMessageResponse(message));
	}
	catch (err) {
		return next(err);
	}
}

module.exports = {
	createMessage
};
