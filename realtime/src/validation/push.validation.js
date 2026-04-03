const AppError = require('../errors/AppError');
const ERROR_CODES = require('../errors/errorCodes');

function isUuidV7(value) {
	return /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function normalizeUuid(value) {
	return value.trim().toLowerCase();
}

function validateUserIds(value) {
	let userIds;

	if (!Array.isArray(value) || value.length === 0) {
		throw new AppError(
			ERROR_CODES.INVALID_ARGUMENT,
			'userIds must be a non-empty array'
		);
	}
	userIds = value.map((item) => {
		if (typeof item !== 'string' || item.trim() === '') {
			throw new AppError(
				ERROR_CODES.INVALID_ARGUMENT,
				'userIds must contain non-empty strings'
			);
		}
		item = normalizeUuid(item);
		if (!isUuidV7(item)) {
			throw new AppError(
				ERROR_CODES.INVALID_ARGUMENT,
				'userIds must contain valid UUIDv7 values'
			);
		}
		return item;
	});
	return Array.from(new Set(userIds));
}

function validateFrame(value) {
	if (!value || typeof value !== 'object' || Array.isArray(value)) {
		throw new AppError(
			ERROR_CODES.INVALID_ARGUMENT,
			'frame must be a JSON object'
		);
	}
	if (typeof value.type !== 'string' || value.type.trim() === '') {
		throw new AppError(
			ERROR_CODES.INVALID_ARGUMENT,
			'frame.type is required'
		);
	}
	return value;
}

function validatePushRequest(body) {
	if (!body || typeof body !== 'object' || Array.isArray(body)) {
		throw new AppError(
			ERROR_CODES.INVALID_ARGUMENT,
			'request body must be a JSON object'
		);
	}
	return {
		userIds: validateUserIds(body.userIds),
		frame: validateFrame(body.frame)
	};
}

module.exports = {
	validatePushRequest
};