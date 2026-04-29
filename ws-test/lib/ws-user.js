const readline = require('readline');
const {WsClient} = require('./ws-client');
const {
	buildDmSend,
	buildDmConversationsList,
	buildDmMessagesList,
	buildDmRead,
	buildNotificationsList,
	buildNotificationsRead,
	buildNotificationsDelete,
	uuidv7
} = require('./contract');

const USERS = {
	alice: process.env.WS_TEST_USER_A_ID,
	bob: process.env.WS_TEST_USER_B_ID,
	charlie: process.env.WS_TEST_USER_C_ID
};

function resolveUser(value) {
	if (value === 'a' || value === 'alice')
		return USERS.alice;
	if (value === 'b' || value === 'bob')
		return USERS.bob;
	if (value === 'c' || value === 'charlie')
		return USERS.charlie;
	return value;
}

function printHelp() {
	console.log('');
	console.log('Commands:');
	console.log('  help');
	console.log('  whoami');
	console.log('  send <user|uuid> <content>');
	console.log('  list [limit] [cursor]');
	console.log('  messages <user|uuid> [limit] [beforeMessageId]');
	console.log('  read <user|uuid> <messageId>');
	console.log('  notifications [limit] [cursor]');
	console.log('  notif-read <notificationId>');
	console.log('  notif-delete <notificationId>');
	console.log('  raw <json>');
	console.log('  quit');
	console.log('');
	console.log('User aliases: alice/a, bob/b, charlie/c');
	console.log('');
}

function parseJson(text) {
	try {
		return JSON.parse(text);
	} catch (error) {
		throw new Error('Invalid JSON');
	}
}

async function handleCommand(client, line) {
	let parts;
	let command;
	let target;
	let content;
	let limit;
	let cursor;
	let frame;
	let notificationId;

	parts = line.trim().split(' ');
	command = parts[0];

	if (!command)
		return;
	if (command === 'help') {
		printHelp();
		return;
	}
	if (command === 'whoami') {
		console.log(client.name + '=' + client.userId);
		return;
	}
	if (command === 'quit' || command === 'exit') {
		await client.close();
		process.exit(0);
	}
	if (command === 'send') {
		target = resolveUser(parts[1]);
		content = parts.slice(2).join(' ');
		if (!target || !content)
			throw new Error('usage: send <user|uuid> <content>');
		frame = buildDmSend(target, content);
		frame.clientMsgId = frame.clientMsgId || uuidv7();
		await client.request(frame, 'dm.send.ok');
		return;
	}
	if (command === 'list') {
		limit = Number(parts[1] || 30);
		cursor = parts[2];
		await client.request(buildDmConversationsList(limit, cursor), 'dm.conversations.list.ok');
		return;
	}
	if (command === 'messages') {
		target = resolveUser(parts[1]);
		limit = Number(parts[2] || 30);
		cursor = parts[3];
		if (!target)
			throw new Error('usage: messages <user|uuid> [limit] [beforeMessageId]');
		await client.request(buildDmMessagesList(target, limit, cursor), 'dm.messages.list.ok');
		return;
	}
	if (command === 'read') {
		target = resolveUser(parts[1]);
		if (!target || !parts[2])
			throw new Error('usage: read <user|uuid> <messageId>');
		await client.request(buildDmRead(target, parts[2]), 'dm.read.ok');
		return;
	}
	if (command === 'notifications') {
		limit = Number(parts[1] || 30);
		cursor = parts[2];
		await client.request(buildNotificationsList(limit, cursor), 'notifications.list.ok');
		return;
	}
	if (command === 'notif-read') {
		notificationId = parts[1];
		if (!notificationId)
			throw new Error('usage: notif-read <notificationId>');
		await client.request(buildNotificationsRead([notificationId]), 'notifications.read.ok');
		return;
	}
	if (command === 'notif-delete') {
		notificationId = parts[1];
		if (!notificationId)
			throw new Error('usage: notif-delete <notificationId>');
		await client.request(buildNotificationsDelete([notificationId]), 'notifications.delete.ok');
		return;
	}
	if (command === 'raw') {
		frame = parseJson(line.slice(4));
		client.send(frame);
		return;
	}
	throw new Error('unknown command: ' + command);
}

async function main() {
	let name;
	let userId;
	let client;
	let rl;

	name = process.argv[2];
	if (!name || !USERS[name])
		throw new Error('usage: node lib/ws-user.js <alice|bob|charlie>');
	userId = USERS[name];
	client = new WsClient(name, userId);

	await client.connect();
	await client.auth();

	console.log('');
	console.log('Connected as ' + name + ' (' + userId + ')');
	printHelp();

	rl = readline.createInterface({
		input: process.stdin,
		output: process.stdout,
		prompt: name + '> '
	});

	rl.prompt();
	rl.on('line', async (line) => {
		try {
			await handleCommand(client, line);
		} catch (error) {
			console.error('[ERROR]', error.message);
		}
		rl.prompt();
	});
}

main().catch((error) => {
	console.error('[FAIL]', error.message);
	process.exit(1);
});