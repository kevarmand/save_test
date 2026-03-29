const https = require('https');
const env = require('./config/env');
const { buildServerTlsOptions } = require('./config/tls');
const createApp = require('./app');

function main() {
	const app = createApp();
	const server = https.createServer(buildServerTlsOptions(), app);

	server.listen(env.http.port, env.http.host, () => {
		console.log(
			'[' + env.service.name + '] listening on https://'
			+ env.http.host + ':' + env.http.port
		);
	});
}

main();