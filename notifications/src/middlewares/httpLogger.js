const {
	logHttpRequestReceived,
	logHttpResponseSent
} = require('../log/logger');

function httpLogger(req, res, next) {
	const originalJson = res.json.bind(res);

	logHttpRequestReceived(req);
	res.json = (payload) => {
		logHttpResponseSent(req, res.statusCode, payload);
		return originalJson(payload);
	};
	return next();
}

module.exports = httpLogger;