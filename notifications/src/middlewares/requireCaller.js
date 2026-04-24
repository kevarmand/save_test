const AppError = require('../errors/AppError');
const ERROR_CODES = require('../errors/errorCodes');

function getCallerCommonName(req) {
	const certificate = req.tls && req.tls.peerCertificate;

	if (!certificate || !certificate.subject)
		return undefined;
	return certificate.subject.CN;
}

function normalizeExpectedCommonNames(expectedCommonNames) {
	if (Array.isArray(expectedCommonNames))
		return expectedCommonNames;
	return [expectedCommonNames];
}

function requireCaller(expectedCommonNames) {
	const allowedCommonNames = normalizeExpectedCommonNames(
		expectedCommonNames
	);

	return (req, res, next) => {
		const caller = getCallerCommonName(req);

		if (!req.tls || req.tls.authorized !== true
			|| !allowedCommonNames.includes(caller)) {
			return next(new AppError(
				ERROR_CODES.UNAUTHORIZED_CALLER,
				'unauthorized caller'
			));
		}
		return next();
	};
}

module.exports = {
	requireCaller
};