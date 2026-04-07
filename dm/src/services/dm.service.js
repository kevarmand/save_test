const AppError = require('../errors/AppError');
const ERROR_CODES = require('../errors/errorCodes');
const dmRepository = require('../repositories/dm.repository');
const realtimeClient = require('../clients/realtime.client');
const notificationClient = require('../clients/notification.client');

function assertDifferentUsers(senderId, otherUserId) {
	if (senderId === otherUserId) {
		throw new AppError(
			ERROR_CODES.FORBIDDEN,
			'cannot use DM endpoints with yourself'
		);
	}
}

function logAsyncFailure(label, err, details) {
	console.error('[dm] async side effect failed', {
		label: label,
		...details
	});
	console.error(err.stack || err);
	if (err.cause) {
		console.error('[dm] async side effect cause');
		console.error(err.cause.stack || err.cause);
	}
}

function fireAndForget(label, task, details) {
	setImmediate(() => {
		task().catch((err) => {
			logAsyncFailure(label, err, details);
		});
	});
}

function logSettledFailure(label, result, details) {
	if (result.status === 'rejected')
		logAsyncFailure(label, result.reason, details);
}

function runCreateMessageSideEffects(message) {
	fireAndForget(
		'createMessageSideEffects',
		async () => {
			const results = await Promise.allSettled([
				realtimeClient.pushDmMessage(message),
				notificationClient.createDmMessageNotification(message)
			]);

			logSettledFailure('pushDmMessage', results[0], {
				messageId: message.messageId,
				targetUserId: message.otherUserId
			});
			logSettledFailure('createDmMessageNotification', results[1], {
				messageId: message.messageId,
				targetUserId: message.otherUserId
			});
		},
		{
			messageId: message.messageId,
			targetUserId: message.otherUserId
		}
	);
}

function runMarkConversationReadSideEffects(command, result) {
	fireAndForget(
		'markConversationReadSideEffects',
		async () => {
			await notificationClient.markDmConversationRead({
				senderId: command.senderId,
				otherUserId: result.otherUserId,
				readUpToMessageId: result.readUpToMessageId
			});
		},
		{
			senderId: command.senderId,
			otherUserId: result.otherUserId,
			readUpToMessageId: result.readUpToMessageId
		}
	);
}

async function createMessage(command) {
	let result;

	assertDifferentUsers(command.senderId, command.otherUserId);
	result = await dmRepository.createMessage({
		senderId: command.senderId,
		otherUserId: command.otherUserId,
		content: command.content,
		clientMessageId: command.clientMessageId
	});
	if (result.created)
		runCreateMessageSideEffects(result.message);
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
	runMarkConversationReadSideEffects(command, result);
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