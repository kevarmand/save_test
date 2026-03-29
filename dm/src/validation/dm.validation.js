const AppError = require('../errors/AppError');

function isUuidV7(value) {
	return /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function validateCreateMessage(command) {
	if (!command || typeof command !== 'object')
		throw new AppError('INVALID_ARGUMENT', 'input is required');
	if (typeof command.senderId !== 'string' || command.senderId.trim() === '')
		throw new AppError('INVALID_ARGUMENT', 'X-User-Id is required');
	if (!isUuidV7(command.senderId))
		throw new AppError('INVALID_ARGUMENT', 'X-User-Id must be a valid UUIDv7');
	if (typeof command.recipientId !== 'string' || command.recipientId.trim() === '')
		throw new AppError('INVALID_ARGUMENT', 'targetUserId is required');
	if (!isUuidV7(command.recipientId))
		throw new AppError('INVALID_ARGUMENT', 'targetUserId must be a valid UUIDv7');
	if (typeof command.content !== 'string' || command.content.trim() === '')
		throw new AppError('INVALID_ARGUMENT', 'content is required');
	if (typeof command.clientMessageId !== 'string' || command.clientMessageId.trim() === '')
		throw new AppError('INVALID_ARGUMENT', 'clientMsgId is required');
	if (!isUuidV7(command.clientMessageId))
		throw new AppError('INVALID_ARGUMENT', 'clientMsgId must be a valid UUIDv7');
}

module.exports = {
	validateCreateMessage
};
