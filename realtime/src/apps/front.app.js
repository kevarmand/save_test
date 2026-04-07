const express = require('express');
const notFound = require('../errors/notFound');
const errorHandler = require('../errors/errorHandler');
const httpLogger = require('../middlewares/httpLogger');

function createFrontApp() {
	const app = express();

	app.use(httpLogger);
	app.use(express.json());
	app.get('/health', (req, res) => {
		return res.status(200).json({
			status: 'ok'
		});
	});
	app.use(notFound);
	app.use(errorHandler);
	return app;
}

module.exports = createFrontApp;