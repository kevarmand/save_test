const AppError = require('../errors/AppError');
const ERROR_CODES = require('../errors/errorCodes');
const env = require('../config/env');

function getClientCommonName(req) {
	const certificate = req.socket.getPeerCertificate();

	if (!certificate || typeof certificate !== 'object')
		return undefined;
	if (!certificate.subject || typeof certificate.subject.CN !== 'string')
		return undefined;
	if (certificate.subject.CN.trim() === '')
		return undefined;
	return certificate.subject.CN.trim();
}

function isAllowedCommonName(commonName) {
	return env.internal.allowedClientCns.includes(commonName);
}

function requireInternalClientAuth(req, res, next) {
	const commonName = getClientCommonName(req);

	if (req.socket.authorized !== true) {
		return next(new AppError(
			ERROR_CODES.UNAUTHORIZED,
			'client certificate required'
		));
	}
	if (!commonName) {
		return next(new AppError(
			ERROR_CODES.UNAUTHORIZED,
			'client certificate common name is missing'
		));
	}
	if (!isAllowedCommonName(commonName)) {
		return next(new AppError(
			ERROR_CODES.UNAUTHORIZED,
			'client certificate is not allowed'
		));
	}
	return next();
}

module.exports = requireInternalClientAuth;