const registryService = require('./registry.service');

function pushToUsers(command) {
	let deliveredUsers;
	let deliveredSockets;

	deliveredUsers = 0;
	deliveredSockets = 0;
	command.userIds.forEach((userId) => {
		const count = registryService.sendToUserSockets(userId, command.frame);

		if (count > 0)
			deliveredUsers += 1;
		deliveredSockets += count;
	});
	return {
		deliveredUsers: deliveredUsers,
		deliveredSockets: deliveredSockets
	};
}

module.exports = {
	pushToUsers
};