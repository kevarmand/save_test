const https = require('https');

function request(options) {
	return new Promise((resolve, reject) => {
		let req;
		let chunks;

		chunks = '';
		req = https.request(options, (res) => {
			res.setEncoding('utf8');
			res.on('data', (chunk) => {
				chunks += chunk;
			});
			res.on('end', () => {
				resolve({
					statusCode: res.statusCode,
					body: chunks
				});
			});
		});
		req.on('error', reject);
		req.end();
	});
}

module.exports = request;
