const https = require('https');
const env = require('../config/env');

function buildTimeoutError(timeoutMs) {
	const err = new Error('upstream request timeout');

	err.code = 'UPSTREAM_TIMEOUT';
	err.timeoutMs = timeoutMs;
	return err;
}

function request(options) {
	return new Promise((resolve, reject) => {
		let req;
		let chunks;
		const timeoutMs = options.timeoutMs || env.timeouts.upstreamRequestMs;
		const requestOptions = {
			protocol: options.protocol,
			hostname: options.hostname,
			port: options.port,
			path: options.path,
			method: options.method,
			agent: options.agent,
			headers: options.headers
		};

		chunks = '';
		req = https.request(requestOptions, (res) => {
			res.setEncoding('utf8');
			res.on('data', (chunk) => {
				chunks += chunk;
			});
			res.on('end', () => {
				resolve({
					statusCode: res.statusCode,
					headers: res.headers,
					body: chunks
				});
			});
		});
		req.setTimeout(timeoutMs, () => {
			req.destroy(buildTimeoutError(timeoutMs));
		});
		req.on('error', reject);
		if (options.body)
			req.write(options.body);
		req.end();
	});
}

module.exports = request;