const AppError = require('../errors/AppError');
const ERROR_CODES = require('../errors/errorCodes');

function isUuidV7(value) {
	return /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function normalizeUuid(value) {
	return value.trim().toLowerCase();
}

function parsePositiveInteger(value, fieldName) {
	const parsed = Number(value);

	if (!Number.isInteger(parsed) || parsed <= 0) {
		throw new AppError(
			ERROR_CODES.INVALID_ARGUMENT,
			fieldName + ' must be a positive integer'
		);
	}
	return parsed;
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

function validateSenderId(value) {
	return validateUuidField(value, 'X-User-Id', 'X-User-Id is required');
}

function validateOtherUserId(value) {
	return validateUuidField(value, 'otherUserId', 'otherUserId is required');
}

function validateClientMessageId(value) {
	return validateUuidField(
		value,
		'clientMsgId',
		'clientMsgId is required'
	);
}

function validateMessageId(value) {
	return validateUuidField(
		value,
		'messageId',
		'messageId is required'
	);
}

function validateOptionalBeforeMessageId(value) {
	if (value === undefined)
		return undefined;
	return validateUuidField(
		value,
		'beforeMessageId',
		'beforeMessageId is required'
	);
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

function validateLimit(value) {
	if (value === undefined)
		return 30;
	value = parsePositiveInteger(value, 'limit');
	if (value > 100) {
		throw new AppError(
			ERROR_CODES.INVALID_ARGUMENT,
			'limit must be less than or equal to 100'
		);
	}
	return value;
}

function validateCreateMessage(command) {
	if (!command || typeof command !== 'object') {
		throw new AppError(
			ERROR_CODES.INVALID_ARGUMENT,
			'input is required'
		);
	}
	return {
		senderId: validateSenderId(command.senderId),
		otherUserId: validateOtherUserId(command.otherUserId),
		content: validateContent(command.content),
		clientMessageId: validateClientMessageId(command.clientMessageId)
	};
}

function validateListMessages(command) {
	if (!command || typeof command !== 'object') {
		throw new AppError(
			ERROR_CODES.INVALID_ARGUMENT,
			'input is required'
		);
	}
	return {
		senderId: validateSenderId(command.senderId),
		otherUserId: validateOtherUserId(command.otherUserId),
		limit: validateLimit(command.limit),
		beforeMessageId: validateOptionalBeforeMessageId(
			command.beforeMessageId
		)
	};
}

function validateMarkConversationRead(command) {
	if (!command || typeof command !== 'object') {
		throw new AppError(
			ERROR_CODES.INVALID_ARGUMENT,
			'input is required'
		);
	}
	return {
		senderId: validateSenderId(command.senderId),
		otherUserId: validateOtherUserId(command.otherUserId),
		messageId: validateMessageId(command.messageId)
	};
}

function validateListConversations(command) {
	if (!command || typeof command !== 'object') {
		throw new AppError(
			ERROR_CODES.INVALID_ARGUMENT,
			'input is required'
		);
	}
	return {
		senderId: validateSenderId(command.senderId)
	};
}

module.exports = {
	validateCreateMessage,
	validateListMessages,
	validateMarkConversationRead,
	validateListConversations
};