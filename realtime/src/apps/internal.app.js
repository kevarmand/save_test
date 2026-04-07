const express = require('express');
const internalRoutes = require('../routes/internal.routes');
const requireInternalClientAuth = require('../middlewares/internalClientAuth');
const notFound = require('../errors/notFound');
const errorHandler = require('../errors/errorHandler');
const httpLogger = require('../middlewares/httpLogger');

function createInternalApp() {
	const app = express();

	app.use(httpLogger);
	app.use(express.json());
	app.use(requireInternalClientAuth);
	app.use('/internal', internalRoutes);
	app.use(notFound);
	app.use(errorHandler);
	return app;
}

module.exports = createInternalApp;