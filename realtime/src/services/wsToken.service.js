const {createHmac, timingSafeEqual} = require('node:crypto');
const AppError = require('../errors/AppError');
const ERROR_CODES = require('../errors/errorCodes');
const env = require('../config/env');

function isUuidV7(value) {
	return /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function normalizeUuid(value) {
	return value.trim().toLowerCase();
}

function unauthorized() {
	return new AppError(
		ERROR_CODES.UNAUTHORIZED,
		'invalid auth token'
	);
}

function decodeBase64UrlToBuffer(value) {
	let input = value.replace(/-/g, '+').replace(/_/g, '/');

	while (input.length % 4 !== 0)
		input += '=';
	return Buffer.from(input, 'base64');
}

function parseJsonBase64Url(value) {
	try {
		return JSON.parse(decodeBase64UrlToBuffer(value).toString('utf8'));
	}
	catch (err) {
		throw unauthorized();
	}
}

function buildSignature(unsignedToken) {
	return createHmac('sha256', env.ws.tokenSecret)
		.update(unsignedToken)
		.digest();
}

function assertValidHeader(header) {
	if (!header || typeof header !== 'object')
		throw unauthorized();
	if (header.alg !== 'HS256')
		throw unauthorized();
	if (header.typ !== 'JWT')
		throw unauthorized();
}

function assertValidSignature(unsignedToken, signaturePart) {
	let providedSignature;
	const expectedSignature = buildSignature(unsignedToken);

	try {
		providedSignature = decodeBase64UrlToBuffer(signaturePart);
	}
	catch (err) {
		throw unauthorized();
	}
	if (providedSignature.length !== expectedSignature.length)
		throw unauthorized();
	if (!timingSafeEqual(providedSignature, expectedSignature))
		throw unauthorized();
}

function validatePayload(payload) {
	if (!payload || typeof payload !== 'object')
		throw unauthorized();
	if (!isUuidV7(payload.sub))
		throw unauthorized();
	if (!Number.isInteger(payload.exp))
		throw unauthorized();
	if (Date.now() >= payload.exp * 1000)
		throw unauthorized();
	return {
		userId: normalizeUuid(payload.sub)
	};
}

function verifyWsToken(token) {
	let parts;
	let header;
	let payload;
	let unsignedToken;

	if (typeof token !== 'string' || token.trim() === '')
		throw unauthorized();
	parts = token.split('.');
	if (parts.length !== 3)
		throw unauthorized();
	header = parseJsonBase64Url(parts[0]);
	payload = parseJsonBase64Url(parts[1]);
	unsignedToken = parts[0] + '.' + parts[1];
	assertValidHeader(header);
	assertValidSignature(unsignedToken, parts[2]);
	return validatePayload(payload);
}

module.exports = {
	verifyWsToken
};