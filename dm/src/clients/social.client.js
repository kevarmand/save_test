const AppError = require('../errors/AppError');
const env = require('../config/env');
const agent = require('./https.agent');
const request = require('./https.request');

async function ensureUsersAreFriends(userId, otherUserId) {
	let response;

	try {
		response = await request({
			protocol: 'https:',
			hostname: env.clients.social.host,
			port: env.clients.social.port,
			path: '/friendships/' + userId + '/' + otherUserId,//TODO check endpoint
			method: 'GET',
			agent: agent
		});
	}
	catch (err) {
		throw new AppError('INTERNAL_ERROR', 'social service error');
	}
	if (response.statusCode === 403) {
		throw new AppError(
			'FORBIDDEN',
			'cannot send message to a non-friend user'
		);
	}
	if (response.statusCode < 200 || response.statusCode >= 300) {
		throw new AppError(
			'INTERNAL_ERROR',
			'social service error'
		);
	}
}

module.exports = {
	ensureUsersAreFriends
};
