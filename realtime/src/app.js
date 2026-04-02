const express = require('express');
const notFound = require('./errors/notFound');
const errorHandler = require('./errors/errorHandler');

function createApp() {
	const app = express();

	app.get('/health', (req, res) => {
		return res.status(200).json({
			status: 'ok'
		});
	});
	app.use(notFound);
	app.use(errorHandler);
	return app;
}

module.exports = createApp;