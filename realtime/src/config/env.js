const dotenv = require('dotenv');

dotenv.config({quiet: true});

function requireEnv(name) {
	const value = process.env[name];

	if (!value)
		throw new Error('Missing required environment variable: ' + name);
	return value;
}

function requireNumberEnv(name) {
	const value = Number(requireEnv(name));

	if (Number.isNaN(value))
		throw new Error('Environment variable must be a number: ' + name);
	return value;
}

const env = {
	service: {
		name: requireEnv('SERVICE_NAME')
	},
	http: {
		host: requireEnv('HOST'),
		port: requireNumberEnv('PORT')
	},
	timeouts: {
		upstreamRequestMs: requireNumberEnv('UPSTREAM_REQUEST_TIMEOUT_MS')
	},
	tls: {
		certPath: requireEnv('SSL_CERT_PATH'),
		keyPath: requireEnv('SSL_KEY_PATH'),
		caPath: requireEnv('SSL_CA_PATH')
	},
	clients: {
		dm: {
			host: requireEnv('DM_SERVICE_HOST'),
			port: requireNumberEnv('DM_SERVICE_PORT')
		}
	},
	ws: {
		path: requireEnv('WS_PATH'),
		tokenSecret: requireEnv('WS_TOKEN_SECRET'),
		authTimeoutMs: requireNumberEnv('WS_AUTH_TIMEOUT_MS'),
		heartbeatIntervalMs: requireNumberEnv('WS_HEARTBEAT_INTERVAL_MS'),
		maxPayloadBytes: requireNumberEnv('WS_MAX_PAYLOAD_BYTES')
	}
};

module.exports = env;