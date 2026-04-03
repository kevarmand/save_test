const crypto = require('crypto');

function fail(message) {
	console.error(message);
	process.exit(1);
}

function base64UrlJson(value) {
	return Buffer.from(JSON.stringify(value)).toString('base64url');
}

function main() {
	let secret;
	let userId;
	let ttlSeconds;
	let now;
	let header;
	let payload;
	let unsignedToken;
	let signature;
	let token;

	secret = process.env.WS_TOKEN_SECRET;
	userId = process.argv[2] || process.env.WS_TEST_USER_ID;
	ttlSeconds = Number(process.argv[3] || process.env.WS_TOKEN_TTL_SECONDS || 315360000);
	if (!secret)
		fail('Missing WS_TOKEN_SECRET');
	if (!userId)
		fail('Missing WS_TEST_USER_ID');
	if (!Number.isInteger(ttlSeconds) || ttlSeconds <= 0)
		fail('ttlSeconds must be a positive integer');
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
	token = unsignedToken + '.' + signature;
	console.log(token);
}

main();