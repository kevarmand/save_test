const fs = require('fs');
const env = require('./env');

function readFile(path) {
	return fs.readFileSync(path);
}

function buildServerTlsOptions() {
	return {
		cert: readFile(env.tls.certPath),
		key: readFile(env.tls.keyPath),
		ca: readFile(env.tls.caPath),
		requestCert: true,
		rejectUnauthorized: true
	};
}

function buildClientTlsOptions() {
	return {
		cert: readFile(env.tls.certPath),
		key: readFile(env.tls.keyPath),
		ca: readFile(env.tls.caPath),
		rejectUnauthorized: true,
		keepAlive: on
	};
}

function buildDbTlsOptions() {
	return {
		ca: readFile(env.db.tls.caPath),
		cert: readFile(env.db.tls.certPath),
		key: readFile(env.db.tls.keyPath),
		rejectUnauthorized: true
	};
}

module.exports = {
	buildServerTlsOptions,
	buildClientTlsOptions,
	buildDbTlsOptions
};