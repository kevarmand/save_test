const AppError = require('../errors/AppError');
const ERROR_CODES = require('../errors/errorCodes');

function isUuidV7(value) {
	return /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function normalizeUuid(value) {
	return value.trim().toLowerCase();
}

function validateUuidField(value, fieldName, requiredMessage) {
	if (typeof value !== 'string' || value.trim() === '') {
		throw new AppError(
			ERROR_CODES.INVALID_ARGUMENT,
			requiredMessage
		);
	}
	value = normalizeUuid(value);
	if (!isUuidV7(value)) {
		throw new AppError(
			ERROR_CODES.INVALID_ARGUMENT,
			fieldName + ' must be a valid UUIDv7'
		);
	}
	return value;
}

function validateContent(value) {
	if (typeof value !== 'string' || value.trim() === '') {
		throw new AppError(
			ERROR_CODES.INVALID_ARGUMENT,
			'content is required'
		);
	}
	return value;
}

function validateCreatedAt(value) {
	if (typeof value !== 'string' || value.trim() === '') {
		throw new AppError(
			ERROR_CODES.INVALID_ARGUMENT,
			'createdAt is required'
		);
	}
	return value;
}

function validateCreateDmMessageNotification(command) {
	if (!command || typeof command !== 'object') {
		throw new AppError(
			ERROR_CODES.INVALID_ARGUMENT,
			'input is required'
		);
	}
	return {
		recipientUserId: validateUuidField(
			command.recipientUserId,
			'recipientUserId',
			'recipientUserId is required'
		),
		senderUserId: validateUuidField(
			command.senderUserId,
			'senderUserId',
			'senderUserId is required'
		),
		messageId: validateUuidField(
			command.messageId,
			'messageId',
			'messageId is required'
		),
		content: validateContent(command.content),
		clientMessageId: validateUuidField(
			command.clientMessageId,
			'clientMsgId',
			'clientMsgId is required'
		),
		createdAt: validateCreatedAt(command.createdAt)
	};
}

function validateMarkDmConversationRead(command) {
	if (!command || typeof command !== 'object') {
		throw new AppError(
			ERROR_CODES.INVALID_ARGUMENT,
			'input is required'
		);
	}
	return {
		readerUserId: validateUuidField(
			command.readerUserId,
			'readerUserId',
			'readerUserId is required'
		),
		otherUserId: validateUuidField(
			command.otherUserId,
			'otherUserId',
			'otherUserId is required'
		),
		readUpToMessageId: validateUuidField(
			command.readUpToMessageId,
			'readUpToMessageId',
			'readUpToMessageId is required'
		)
	};
}

module.exports = {
	validateCreateDmMessageNotification,
	validateMarkDmConversationRead
};