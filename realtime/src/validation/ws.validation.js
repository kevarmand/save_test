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
		throw new AppError(ERROR_CODES.INVALID_ARGUMENT, requiredMessage);
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

function validateOptionalRequestId(value) {
	if (value === undefined)
		return undefined;
	if (typeof value !== 'string' || value.trim() === '') {
		throw new AppError(
			ERROR_CODES.INVALID_ARGUMENT,
			'requestId must be a non-empty string'
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

function validateOptionalLimit(value) {
	if (value === undefined)
		return undefined;
	if (!Number.isInteger(value) || value <= 0) {
		throw new AppError(
			ERROR_CODES.INVALID_ARGUMENT,
			'limit must be a positive integer'
		);
	}
	return value;
}

function validateOptionalCursor(value) {
	if (value === undefined)
		return undefined;
	return validateUuidField(
		value,
		'cursor',
		'cursor is required'
	);
}

function validateOptionalNotificationCursor(value) {
	if (value === undefined)
		return undefined;
	return validateUuidField(
		value,
		'cursor',
		'cursor is required'
	);
}

function validateOptionalMessageId(value, fieldName) {
	if (value === undefined)
		return undefined;
	return validateUuidField(value, fieldName, fieldName + ' is required');
}

function validateUuidArray(value, fieldName) {
	if (!Array.isArray(value) || value.length === 0) {
		throw new AppError(
			ERROR_CODES.INVALID_ARGUMENT,
			fieldName + ' must be a non-empty array'
		);
	}
	return value.map((item) => {
		return validateUuidField(
			item,
			fieldName,
			fieldName + ' must contain valid UUIDv7 values'
		);
	});
}

function validateIncomingFrame(rawData) {
	let frame;

	try {
		frame = JSON.parse(rawData.toString('utf8'));
	}
	catch (err) {
		throw new AppError(
			ERROR_CODES.INVALID_ARGUMENT,
			'invalid JSON frame'
		);
	}
	if (!frame || typeof frame !== 'object' || Array.isArray(frame)) {
		throw new AppError(
			ERROR_CODES.INVALID_ARGUMENT,
			'frame must be a JSON object'
		);
	}
	if (typeof frame.type !== 'string' || frame.type.trim() === '') {
		throw new AppError(
			ERROR_CODES.INVALID_ARGUMENT,
			'frame.type is required'
		);
	}
	return frame;
}

function validateAuthFrame(frame) {
	if (typeof frame.token !== 'string' || frame.token.trim() === '') {
		throw new AppError(
			ERROR_CODES.INVALID_ARGUMENT,
			'token is required'
		);
	}
	return {
		token: frame.token
	};
}

function validateDmSendFrame(frame) {
	return {
		requestId: validateOptionalRequestId(frame.requestId),
		otherUserId: validateUuidField(
			frame.otherUserId,
			'otherUserId',
			'otherUserId is required'
		),
		content: validateContent(frame.content),
		clientMessageId: validateUuidField(
			frame.clientMsgId,
			'clientMsgId',
			'clientMsgId is required'
		)
	};
}

function validateDmConversationsListFrame(frame) {
	return {
		requestId: validateOptionalRequestId(frame.requestId),
		limit: validateOptionalLimit(frame.limit),
		cursor: validateOptionalCursor(frame.cursor)
	};
}

function validateDmMessagesListFrame(frame) {
	return {
		requestId: validateOptionalRequestId(frame.requestId),
		otherUserId: validateUuidField(
			frame.otherUserId,
			'otherUserId',
			'otherUserId is required'
		),
		limit: validateOptionalLimit(frame.limit),
		beforeMessageId: validateOptionalMessageId(
			frame.beforeMessageId,
			'beforeMessageId'
		)
	};
}

function validateDmReadFrame(frame) {
	return {
		requestId: validateOptionalRequestId(frame.requestId),
		otherUserId: validateUuidField(
			frame.otherUserId,
			'otherUserId',
			'otherUserId is required'
		),
		messageId: validateUuidField(
			frame.messageId,
			'messageId',
			'messageId is required'
		)
	};
}

function validateNotificationsListFrame(frame) {
	return {
		requestId: validateOptionalRequestId(frame.requestId),
		limit: validateOptionalLimit(frame.limit),
		cursor: validateOptionalNotificationCursor(frame.cursor)
	};
}

function validateNotificationsReadFrame(frame) {
	return {
		requestId: validateOptionalRequestId(frame.requestId),
		notificationIds: validateUuidArray(
			frame.notificationIds,
			'notificationIds'
		)
	};
}

function validateAuthenticatedFrame(frame) {
	if (frame.type === 'dm.send')
		return validateDmSendFrame(frame);
	if (frame.type === 'dm.conversations.list')
		return validateDmConversationsListFrame(frame);
	if (frame.type === 'dm.messages.list')
		return validateDmMessagesListFrame(frame);
	if (frame.type === 'dm.read')
		return validateDmReadFrame(frame);
	if (frame.type === 'notifications.list')
		return validateNotificationsListFrame(frame);
	if (frame.type === 'notifications.read')
		return validateNotificationsReadFrame(frame);
	throw new AppError(ERROR_CODES.INVALID_ARGUMENT, 'unknown frame type');
}

module.exports = {
	validateIncomingFrame,
	validateAuthFrame,
	validateAuthenticatedFrame
};