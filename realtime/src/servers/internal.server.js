const https = require('https');
const env = require('../config/env');
const {buildInternalServerTlsOptions} = require('../config/tls');
const createInternalApp = require('../apps/internal.app');

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

function installInternalServerDebug(server) {
	server.on('secureConnection', (socket) => {
		console.log('[realtime] internal tls secure connection', {
			remoteAddress: socket.remoteAddress,
			authorized: socket.authorized,
			authorizationError: socket.authorizationError,
			clientCn: getPeerCommonName(socket)
		});
	});
	server.on('tlsClientError', (err, socket) => {
		console.error('[realtime] internal tls client error', {
			message: err.message,
			code: err.code,
			remoteAddress: socket.remoteAddress
		});
	});
}

function createInternalServer() {
	const app = createInternalApp();
	const server = https.createServer(buildInternalServerTlsOptions(), app);

	installInternalServerDebug(server);
	return server;
}

function listenInternalServer(server) {
	server.listen(env.internal.port, env.internal.host, () => {
		console.log(
			'[' + env.service.name + '] internal listener on https://'
			+ env.internal.host + ':' + env.internal.port
			+ ' allowed CNs=' + env.internal.allowedClientCns.join(',')
		);
	});
}

module.exports = {
	createInternalServer,
	listenInternalServer
};