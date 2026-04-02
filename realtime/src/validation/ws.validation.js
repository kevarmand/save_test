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

function validateChatSendFrame(frame) {
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

module.exports = {
	validateIncomingFrame,
	validateAuthFrame,
	validateChatSendFrame
};