const crypto = require('crypto');
const fs = require('fs');

function requireSecret(name) {
	const file = process.env[name + '_FILE'];

	if (file)
		return fs.readFileSync(file, 'utf8').trim();
	return process.env[name];
}

function base64UrlJson(value) {
	return Buffer.from(JSON.stringify(value)).toString('base64url');
}

function createToken(userId, ttlSeconds) {
	let secret;
	let now;
	let header;
	let payload;
	let unsignedToken;
	let signature;

	secret = requireSecret('WS_TOKEN_SECRET');
	if (!secret)
		throw new Error('Missing WS_TOKEN_SECRET or WS_TOKEN_SECRET_FILE');
	if (!userId)
		throw new Error('Missing userId');
	ttlSeconds = Number(ttlSeconds || process.env.WS_TOKEN_TTL_SECONDS || 315360000);
	if (!Number.isInteger(ttlSeconds) || ttlSeconds <= 0)
		throw new Error('ttlSeconds must be a positive integer');
	now = Math.floor(Date.now() / 1000);
	header = base64UrlJson({
		alg: 'HS256',
		typ: 'JWT'
	});
	payload = base64UrlJson({
		sub: userId,
		exp: now + ttlSeconds
	});
	unsignedToken = header + '.' + payload;
	signature = crypto
		.createHmac('sha256', secret)
		.update(unsignedToken)
		.digest('base64url');
	return unsignedToken + '.' + signature;
}

module.exports = {
	createToken
};