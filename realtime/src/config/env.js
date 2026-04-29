const fs = require('fs');
const dotenv = require('dotenv');

dotenv.config({quiet: true});

function requireEnv(name) {
	const value = process.env[name];

	if (!value)
		throw new Error('Missing required environment variable: ' + name);
	return value;
}

function requireSecretEnv(name) {
	const file = process.env[name + '_FILE'];

	if (file)
		return fs.readFileSync(file, 'utf8').trim();
	return requireEnv(name);
}

function requireNumberEnv(name) {
	const value = Number(requireEnv(name));

	if (Number.isNaN(value))
		throw new Error('Environment variable must be a number: ' + name);
	return value;
}

function requireCsvEnv(name) {
	const values = requireEnv(name)
		.split(',')
		.map((item) => item.trim())
		.filter((item) => item !== '');

	if (values.length === 0) {
		throw new Error(
			'Environment variable must contain at least one value: ' + name
		);
	}
	return values;
}

const env = {
	service: {
		name: requireEnv('SERVICE_NAME')
	},
	http: {
		host: requireEnv('HOST'),
		port: requireNumberEnv('PORT')
	},
	internal: {
		host: requireEnv('INTERNAL_HOST'),
		port: requireNumberEnv('INTERNAL_PORT'),
		allowedClientCns: requireCsvEnv('INTERNAL_ALLOWED_CLIENT_CNS')
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
		},
		notifications: {
			host: requireEnv('NOTIFICATIONS_SERVICE_HOST'),
			port: requireNumberEnv('NOTIFICATIONS_SERVICE_PORT')
		}
	},
	ws: {
		path: requireEnv('WS_PATH'),
		tokenSecret: requireSecretEnv('WS_TOKEN_SECRET'),
		authTimeoutMs: requireNumberEnv('WS_AUTH_TIMEOUT_MS'),
		heartbeatIntervalMs: requireNumberEnv('WS_HEARTBEAT_INTERVAL_MS'),
		maxPayloadBytes: requireNumberEnv('WS_MAX_PAYLOAD_BYTES')
	}
};

module.exports = env;