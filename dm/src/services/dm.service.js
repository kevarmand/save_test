const AppError = require('../errors/AppError');
const ERROR_CODES = require('../errors/errorCodes');
const userDirectory = require('../clients/user.client');
const socialGraph = require('../clients/social.client');
const dmRepository = require('../repositories/dm.repository');

async function createMessage(command) {
	if (command.senderId === command.recipientId) {
		throw new AppError(
			ERROR_CODES.FORBIDDEN,
			'cannot send message to yourself'
		);
	}
	//TODO
	// await userDirectory.ensureUserExists(command.recipientId);
	// await socialGraph.ensureUsersAreFriends(
	// 	command.senderId,
	// 	command.recipientId
	// );
	return dmRepository.createMessage({
		senderId: command.senderId,
		recipientId: command.recipientId,
		content: command.content,
		clientMessageId: command.clientMessageId
	});
}

module.exports = {
	createMessage
};