const express = require('express');
const notificationsRoutes = require('./routes/notifications.routes');
const internalRoutes = require('./routes/internal.routes');
const notFound = require('./errors/notFound');
const errorHandler = require('./errors/errorHandler');
const {requireCaller} = require('./middlewares/requireCaller');
const httpLogger = require('./middlewares/httpLogger');

function attachTlsContext(req, res, next) {
	req.tls = {
		authorized: req.client.authorized,
		authorizationError: req.client.authorizationError,
		peerCertificate: req.socket.getPeerCertificate()
	};
	next();
}

function createApp() {
	const app = express();

	app.use(attachTlsContext);
	app.use(httpLogger);
	app.use('/notifications', requireCaller('realtime'), express.json(), notificationsRoutes);
	app.use('/internal', requireCaller('dm'), express.json(), internalRoutes);
	app.use(notFound);
	app.use(errorHandler);
	return app;
}

module.exports = createApp;