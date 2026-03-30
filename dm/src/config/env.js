const dotenv = require('dotenv');

// Silently ignore missing .env file, since we require all env vars explicitly
dotenv.config({ quiet: true });

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
		user: {
			host: requireEnv('USER_SERVICE_HOST'),
			port: requireNumberEnv('USER_SERVICE_PORT')
		},
		social: {
			host: requireEnv('SOCIAL_SERVICE_HOST'),
			port: requireNumberEnv('SOCIAL_SERVICE_PORT')
		}
	}
};

module.exports = env;