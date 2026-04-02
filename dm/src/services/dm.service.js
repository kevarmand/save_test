const AppError = require('../errors/AppError');
const ERROR_CODES = require('../errors/errorCodes');
const dmRepository = require('../repositories/dm.repository');

function assertDifferentUsers(senderId, otherUserId) {
	if (senderId === otherUserId) {
		throw new AppError(
			ERROR_CODES.FORBIDDEN,
			'cannot use DM endpoints with yourself'
		);
	}
}

async function createMessage(command) {
	assertDifferentUsers(command.senderId, command.otherUserId);
	return dmRepository.createMessage({
		senderId: command.senderId,
		otherUserId: command.otherUserId,
		content: command.content,
		clientMessageId: command.clientMessageId
	});
}

async function listMessages(command) {
	let result;

	assertDifferentUsers(command.senderId, command.otherUserId);
	result = await dmRepository.listMessages({
		senderId: command.senderId,
		otherUserId: command.otherUserId,
		limit: command.limit,
		beforeMessageId: command.beforeMessageId
	});
	if (result.error === 'before_message_not_found') {
		throw new AppError(
			ERROR_CODES.INVALID_ARGUMENT,
			'beforeMessageId not found in this conversation'
		);
	}
	return result;
}

async function markConversationRead(command) {
	let result;

	assertDifferentUsers(command.senderId, command.otherUserId);
	result = await dmRepository.markConversationRead({
		senderId: command.senderId,
		otherUserId: command.otherUserId,
		messageId: command.messageId
	});
	if (result.error === 'conversation_not_found') {
		throw new AppError(
			ERROR_CODES.NOT_FOUND,
			'conversation not found'
		);
	}
	if (result.error === 'message_not_found') {
		throw new AppError(
			ERROR_CODES.NOT_FOUND,
			'message not found in this conversation'
		);
	}
	return result;
}

async function listConversations(command) {
	return dmRepository.listConversations(command.senderId);
}

module.exports = {
	createMessage,
	listMessages,
	markConversationRead,
	listConversations
};