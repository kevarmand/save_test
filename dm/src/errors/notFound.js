const AppError = require('./AppError');
const ERROR_CODES = require('./errorCodes');

function notFound(req, res, next) {
	return next(new AppError(ERROR_CODES.NOT_FOUND, 'Route not found'));
}

module.exports = notFound;