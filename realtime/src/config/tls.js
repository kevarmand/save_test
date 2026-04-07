const fs = require('fs');
const env = require('./env');

function buildBaseTlsOptions() {
	return {
		cert: fs.readFileSync(env.tls.certPath),
		key: fs.readFileSync(env.tls.keyPath),
		ca: fs.readFileSync(env.tls.caPath)
	};
}

function buildFrontServerTlsOptions() {
	return buildBaseTlsOptions();
}

function buildInternalServerTlsOptions() {
	return {
		...buildBaseTlsOptions(),
		requestCert: true,
		rejectUnauthorized: true
	};
}

function buildClientTlsOptions() {
	return {
		...buildBaseTlsOptions(),
		rejectUnauthorized: true
	};
}

module.exports = {
	buildFrontServerTlsOptions,
	buildInternalServerTlsOptions,
	buildClientTlsOptions
};