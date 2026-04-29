const fs = require('fs');
const WebSocket = require('ws');
const {createToken} = require('./token');

function createId(prefix) {
	return prefix + '-' + Date.now() + '-' + Math.random().toString(16).slice(2);
}

function sleep(ms) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

class WsClient {
	constructor(name, userId) {
		this.name = name;
		this.userId = userId;
		this.messages = [];
		this.ws = null;
		this.defaultTimeout = Number(process.env.WS_REQUEST_TIMEOUT_MS || 5000);
	}

	connect() {
		return new Promise((resolve, reject) => {
			const options = {};

			if (process.env.WS_CA_PATH)
				options.ca = fs.readFileSync(process.env.WS_CA_PATH);
			this.ws = new WebSocket(process.env.WS_URL, options);
			this.ws.on('open', resolve);
			this.ws.on('error', reject);
			this.ws.on('message', (raw) => this.onMessage(raw));
		});
	}

	onMessage(raw) {
		let message;

		try {
			message = JSON.parse(raw.toString());
		} catch (error) {
			message = {
				type: '__invalid_json__',
				raw: raw.toString()
			};
		}
		this.messages.push(message);
		console.log('[' + this.name + ' <=]', JSON.stringify(message));
	}

	send(frame) {
		console.log('[' + this.name + ' =>]', JSON.stringify(frame));
		this.ws.send(JSON.stringify(frame));
	}

	async auth() {
		const token = createToken(this.userId);

		this.send({
			type: 'auth',
			token
		});
		return this.waitFor((message) => message.type === 'auth.ok');
	}

	async request(frame, expectedType) {
		const requestId = frame.requestId || createId(frame.type);
		let response;

		frame.requestId = requestId;
		this.send(frame);
		response = await this.waitFor((message) => {
			if (message.type === 'error' && message.requestId === requestId)
				return true;
			return message.type === expectedType && message.requestId === requestId;
		});
		if (response.type === 'error')
			throw new Error('Request failed: ' + JSON.stringify(response));
		return response;
	}

	waitFor(predicate, timeoutMs) {
		const timeout = timeoutMs || this.defaultTimeout;
		const start = Date.now();

		return new Promise((resolve, reject) => {
			const timer = setInterval(() => {
				const found = this.messages.find(predicate);

				if (found) {
					clearInterval(timer);
					resolve(found);
					return;
				}
				if (Date.now() - start >= timeout) {
					clearInterval(timer);
					reject(new Error('Timeout waiting for message on ' + this.name));
				}
			}, 25);
		});
	}

	async close() {
		if (!this.ws)
			return;
		this.ws.close();
		await sleep(100);
	}
}

module.exports = {
	WsClient
};