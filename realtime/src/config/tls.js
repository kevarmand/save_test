const fs = require('fs');
const env = require('./env');

function buildServerTlsOptions() {
	return {
		cert: fs.readFileSync(env.tls.certPath),
		key: fs.readFileSync(env.tls.keyPath),
		ca: fs.readFileSync(env.tls.caPath)
	};
}

function buildClientTlsOptions() {
	return {
		cert: fs.readFileSync(env.tls.certPath),
		key: fs.readFileSync(env.tls.keyPath),
		ca: fs.readFileSync(env.tls.caPath),
		rejectUnauthorized: true
	};
}

module.exports = {
	buildServerTlsOptions,
	buildClientTlsOptions
};