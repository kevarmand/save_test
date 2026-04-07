const https = require('https');
const env = require('./config/env');
const {buildServerTlsOptions} = require('./config/tls');
const createApp = require('./app');

function getPeerCommonName(socket) {
	const certificate = socket.getPeerCertificate();

	if (!certificate || typeof certificate !== 'object')
		return undefined;
	if (!certificate.subject || typeof certificate.subject.CN !== 'string')
		return undefined;
	if (certificate.subject.CN.trim() === '')
		return undefined;
	return certificate.subject.CN.trim();
}

function installTlsDebug(server) {
	server.on('secureConnection', (socket) => {
		console.log('[notifications] tls secure connection', {
			remoteAddress: socket.remoteAddress,
			authorized: socket.authorized,
			authorizationError: socket.authorizationError,
			clientCn: getPeerCommonName(socket)
		});
	});
	server.on('tlsClientError', (err, socket) => {
		console.error('[notifications] tls client error', {
			message: err.message,
			code: err.code,
			remoteAddress: socket.remoteAddress
		});
	});
}

function main() {
	const app = createApp();
	const server = https.createServer(buildServerTlsOptions(), app);

	installTlsDebug(server);
	server.listen(env.http.port, env.http.host, () => {
		console.log(
			'[' + env.service.name + '] listening on https://'
			+ env.http.host + ':' + env.http.port
		);
	});
}

main();