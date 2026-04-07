const {
	createFrontServer,
	listenFrontServer
} = require('./servers/front.server');
const {
	createInternalServer,
	listenInternalServer
} = require('./servers/internal.server');

function main() {
	const frontServer = createFrontServer();
	const internalServer = createInternalServer();

	listenFrontServer(frontServer);
	listenInternalServer(internalServer);
}

main();