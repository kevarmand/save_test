const AppError = require('../errors/AppError');
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
		throw new AppError('INTERNAL_ERROR', 'user service error');
	}
	if (response.statusCode === 404) {
		throw new AppError(
			'TARGET_USER_NOT_FOUND',
			'target user not found'
		);
	}
	if (response.statusCode < 200 || response.statusCode >= 300) {
		throw new AppError(
			'INTERNAL_ERROR',
			'user service error'
		);
	}
}

module.exports = {
	ensureUserExists
};
