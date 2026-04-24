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

function validateUserId(value) {
	return validateUuidField(value, 'X-User-Id', 'X-User-Id is required');
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

function validateOptionalCursor(value) {
	if (value === undefined)
		return undefined;
	return validateUuidField(
		value,
		'cursor',
		'cursor is required'
	);
}

function validateNotificationIds(value) {
	if (!Array.isArray(value) || value.length === 0) {
		throw new AppError(
			ERROR_CODES.INVALID_ARGUMENT,
			'notificationIds must be a non-empty array'
		);
	}
	return Array.from(new Set(value.map((item) => {
		return validateUuidField(
			item,
			'notificationIds',
			'notificationIds must contain valid UUIDv7 values'
		);
	})));
}

function validateListNotifications(command) {
	if (!command || typeof command !== 'object') {
		throw new AppError(
			ERROR_CODES.INVALID_ARGUMENT,
			'input is required'
		);
	}
	return {
		userId: validateUserId(command.userId),
		limit: validateLimit(command.limit),
		cursor: validateOptionalCursor(command.cursor)
	};
}

function validateMarkNotificationsRead(command) {
	if (!command || typeof command !== 'object') {
		throw new AppError(
			ERROR_CODES.INVALID_ARGUMENT,
			'input is required'
		);
	}
	return {
		userId: validateUserId(command.userId),
		notificationIds: validateNotificationIds(command.notificationIds)
	};
}

function validateDeleteNotifications(command) {
	if (!command || typeof command !== 'object') {
		throw new AppError(
			ERROR_CODES.INVALID_ARGUMENT,
			'input is required'
		);
	}
	return {
		userId: validateUserId(command.userId),
		notificationIds: validateNotificationIds(command.notificationIds)
	};
}

module.exports = {
	validateListNotifications,
	validateMarkNotificationsRead,
	validateDeleteNotifications
};