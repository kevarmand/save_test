const https = require('https');
const env = require('../config/env');
const {buildFrontServerTlsOptions} = require('../config/tls');
const createFrontApp = require('../apps/front.app');
const attachWebSocketServer = require('../ws/attachWebSocketServer');

function installFrontServerDebug(server) {
	server.on('tlsClientError', (err, socket) => {
		console.error('[realtime] front tls client error', {
			message: err.message,
			code: err.code,
			remoteAddress: socket.remoteAddress
		});
	});
}

function createFrontServer() {
	const app = createFrontApp();
	const server = https.createServer(buildFrontServerTlsOptions(), app);

	attachWebSocketServer(server);
	installFrontServerDebug(server);
	return server;
}

function listenFrontServer(server) {
	server.listen(env.http.port, env.http.host, () => {
		console.log(
			'[' + env.service.name + '] front listener on https://'
			+ env.http.host + ':' + env.http.port
			+ ' (ws path: ' + env.ws.path + ')'
		);
	});
}

module.exports = {
	createFrontServer,
	listenFrontServer
};