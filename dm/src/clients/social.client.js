const AppError = require('../errors/AppError');
const ERROR_CODES = require('../errors/errorCodes');
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
			path: '/friendships/' + userId + '/' + otherUserId,
			method: 'GET',
			agent: agent
		});
	}
	catch (err) {
		throw new AppError(
			ERROR_CODES.INTERNAL_ERROR,
			'social service error',
			{
				cause: err,
				details: {
					service: 'social',
					operation: 'ensureUsersAreFriends',
					userId: userId,
					otherUserId: otherUserId
				}
			}
		);
	}
	if (response.statusCode === 403) {
		throw new AppError(
			ERROR_CODES.FORBIDDEN,
			'cannot send message to a non-friend user',
			{
				details: {
					service: 'social',
					operation: 'ensureUsersAreFriends',
					userId: userId,
					otherUserId: otherUserId,
					upstreamStatusCode: response.statusCode
				}
			}
		);
	}
	if (response.statusCode < 200 || response.statusCode >= 300) {
		throw new AppError(
			ERROR_CODES.INTERNAL_ERROR,
			'social service error',
			{
				details: {
					service: 'social',
					operation: 'ensureUsersAreFriends',
					userId: userId,
					otherUserId: otherUserId,
					upstreamStatusCode: response.statusCode
				}
			}
		);
	}
}

module.exports = {
	ensureUsersAreFriends
};