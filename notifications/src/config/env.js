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
	db: {
		url: requireEnv('DATABASE_URL_RUNTIME'),
		tls: {
			caPath: requireEnv('DB_SSL_CA_PATH'),
			certPath: requireEnv('DB_SSL_CERT_PATH'),
			keyPath: requireEnv('DB_SSL_KEY_PATH')
		}
	},
	clients: {
		realtime: {
			host: requireEnv('REALTIME_SERVICE_HOST'),
			port: requireNumberEnv('REALTIME_SERVICE_PORT')
		}
	}
};

module.exports = env;