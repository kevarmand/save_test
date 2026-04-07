const express = require('express');
const dmRoutes = require('./routes/dm.routes');
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
	app.use('/dm', requireCaller('realtime'), express.json(), dmRoutes);
	app.use(notFound);
	app.use(errorHandler);

	return app;
}

module.exports = createApp;