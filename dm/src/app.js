const express = require('express');
const dmRoutes = require('./routes/dm.routes');
const notFound = require('./errors/notFound');
const errorHandler = require('./errors/errorHandler');

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

	app.use(express.json());
	app.use(attachTlsContext);
	app.use('/dm', dmRoutes);
	app.use(notFound);
	app.use(errorHandler);

	return app;
}

module.exports = createApp;