const dmClient = require('../clients/dm.client');

async function sendMessage(command) {
	return dmClient.createMessage({
		senderId: command.senderId,
		otherUserId: command.otherUserId,
		content: command.content,
		clientMessageId: command.clientMessageId
	});
}

module.exports = {
	sendMessage
};