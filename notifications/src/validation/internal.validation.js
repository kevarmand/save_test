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

function validateCommentAction(value) {
	if (typeof value !== 'string' || value.trim() === '') {
		throw new AppError(
			ERROR_CODES.INVALID_ARGUMENT,
			'action is required'
		);
	}
	value = value.trim();
	if (value !== 'created') {
		throw new AppError(
			ERROR_CODES.INVALID_ARGUMENT,
			'action must be created'
		);
	}
	return value;
}

function validateCreateCommentEvent(command) {
	if (!command || typeof command !== 'object') {
		throw new AppError(
			ERROR_CODES.INVALID_ARGUMENT,
			'input is required'
		);
	}
	return {
		action: validateCommentAction(command.action),
		commentId: validateUuidField(
			command.commentId,
			'commentId',
			'commentId is required'
		),
		postId: validateUuidField(
			command.postId,
			'postId',
			'postId is required'
		),
		postOwnerId: validateUuidField(
			command.postOwnerId,
			'postOwnerId',
			'postOwnerId is required'
		),
		actorUserId: validateUuidField(
			command.actorUserId,
			'actorUserId',
			'actorUserId is required'
		)
	};
}

module.exports = {
	validateCreateCommentEvent
};