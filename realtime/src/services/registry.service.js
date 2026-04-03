const {sendJson} = require('../ws/send');

const allSockets = new Set();
const socketsByUserId = new Map();
const userIdBySocket = new Map();

function addSocket(ws) {
	allSockets.add(ws);
}

function bindSocketToUser(userId, ws) {
	let userSockets;

	userIdBySocket.set(ws, userId);
	userSockets = socketsByUserId.get(userId);
	if (!userSockets) {
		userSockets = new Set();
		socketsByUserId.set(userId, userSockets);
	}
	userSockets.add(ws);
}

function removeSocket(ws) {
	const userId = userIdBySocket.get(ws);
	const userSockets = socketsByUserId.get(userId);

	allSockets.delete(ws);
	userIdBySocket.delete(ws);
	if (!userSockets)
		return;
	userSockets.delete(ws);
	if (userSockets.size === 0)
		socketsByUserId.delete(userId);
}

function sendToUserSockets(userId, frame) {
	let deliveredCount;
	const userSockets = socketsByUserId.get(userId);

	if (!userSockets)
		return 0;
	deliveredCount = 0;
	userSockets.forEach((socket) => {
		sendJson(socket, frame);
		deliveredCount += 1;
	});
	return deliveredCount;
}

function forEachSocket(callback) {
	allSockets.forEach(callback);
}

module.exports = {
	addSocket,
	bindSocketToUser,
	removeSocket,
	sendToUserSockets,
	forEachSocket
};