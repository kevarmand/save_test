const AppError = require('../errors/AppError');
const ERROR_CODES = require('../errors/errorCodes');
const dmRepository = require('../repositories/dm.repository');
const realtimeClient = require('../clients/realtime.client');
// const userClient = require('../clients/user.client');
// const socialClient = require('../clients/social.client');

function logSideEffectFailure(operation, err, details) {
	console.error('[dm] side effect failed', {
		operation: operation,
		code: err && err.code,
		message: err && err.message,
		details: details
	});
}

async function runBestEffort(operation, details, fn) {
	try {
		await fn();
	}
	catch (err) {
		logSideEffectFailure(operation, err, details);
	}
}

function assertDifferentUsers(senderId, otherUserId) {
	if (senderId === otherUserId) {
		throw new AppError(
			ERROR_CODES.FORBIDDEN,
			'cannot use DM endpoints with yourself'
		);
	}
}

async function validateCreateMessageDependencies(command) {
	// TODO :Réactiver ces vérifications quand les services user/social
	// seront disponibles sur cette branche.
	//
	// await userClient.ensureUserExists(command.otherUserId);
	// await socialClient.ensureUsersAreFriends(
	// 	command.senderId,
	// 	command.otherUserId
	// );
}

async function createMessage(command) {
	let result;

	assertDifferentUsers(command.senderId, command.otherUserId);
	await validateCreateMessageDependencies(command);
	result = await dmRepository.createMessage({
		senderId: command.senderId,
		otherUserId: command.otherUserId,
		content: command.content,
		clientMessageId: command.clientMessageId
	});
	if (result.created) {
		await runBestEffort(
			'pushDmMessage',
			{
				targetUserId: result.message.otherUserId,
				messageId: result.message.messageId
			},
			() => realtimeClient.pushDmMessage(result.message)
		);
	}
	return result.message;
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
	return dmRepository.listConversations({
		senderId: command.senderId,
		limit: command.limit,
		cursor: command.cursor
	});
}

module.exports = {
	createMessage,
	listMessages,
	markConversationRead,
	listConversations
};