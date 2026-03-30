const fs = require('fs');
const env = require('./env');

function readFile(path) {
	return fs.readFileSync(path);
}

function buildServerTlsOptions() {
	return {
		cert: fs.readFileSync(env.tls.certPath),
		key: fs.readFileSync(env.tls.keyPath),
		ca: fs.readFileSync(env.tls.caPath),
		requestCert: true,
		rejectUnauthorized: true
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