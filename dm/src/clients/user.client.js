const AppError = require('../errors/AppError');
const ERROR_CODES = require('../errors/errorCodes');
const env = require('../config/env');
const agent = require('./https.agent');
const request = require('./https.request');

async function ensureUserExists(userId) {
	let response;

	try {
		response = await request({
			protocol: 'https:',
			hostname: env.clients.user.host,
			port: env.clients.user.port,
			path: '/users/' + userId,
			method: 'GET',
			agent: agent
		});
	}
	catch (err) {
		throw new AppError(
			ERROR_CODES.INTERNAL_ERROR,
			'user service error',
			{
				cause: err,
				details: {
					service: 'user',
					operation: 'ensureUserExists',
					targetUserId: userId
				}
			}
		);
	}
	if (response.statusCode === 404) {
		throw new AppError(
			ERROR_CODES.TARGET_USER_NOT_FOUND,
			'target user not found',
			{
				details: {
					service: 'user',
					operation: 'ensureUserExists',
					targetUserId: userId,
					upstreamStatusCode: response.statusCode
				}
			}
		);
	}
	if (response.statusCode < 200 || response.statusCode >= 300) {
		throw new AppError(
			ERROR_CODES.INTERNAL_ERROR,
			'user service error',
			{
				details: {
					service: 'user',
					operation: 'ensureUserExists',
					targetUserId: userId,
					upstreamStatusCode: response.statusCode
				}
			}
		);
	}
}

module.exports = {
	ensureUserExists
};