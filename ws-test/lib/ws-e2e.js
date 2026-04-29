const {WsClient} = require('./ws-client');
const {assert, pass, step} = require('./assert');
const {
	buildDmSend,
	buildDmConversationsList,
	buildDmMessagesList,
	buildDmRead,
	buildNotificationsList,
	buildNotificationsRead,
	buildNotificationsDelete,
	extractMessageId,
	extractOtherUserId,
	extractNotifications,
	extractNotificationId,
	isDmPushWithContent
} = require('./contract');

const DEFAULT_USER_A = '019d3641-b111-7cc2-98c4-dc0c0f4a1111';
const DEFAULT_USER_B = '019d3641-b222-7cc2-98c4-dc0c0f4a2222';
const DEFAULT_USER_C = '019d3641-b333-7cc2-98c4-dc0c0f4a3333';

function getUser(name, fallback) {
	return process.env[name] || fallback;
}

function contains(value, expected) {
	return JSON.stringify(value).includes(expected);
}

async function testAuth(alice, bob, charlie) {
	step('connect users');
	await alice.connect();
	await bob.connect();
	await charlie.connect();
	pass('websocket connections opened');

	step('authenticate users');
	await alice.auth();
	await bob.auth();
	await charlie.auth();
	pass('all users authenticated');
}

async function testDmFlow(alice, bob, userB) {
	let content;
	let sendResponse;
	let messageId;
	let otherUserId;
	let conversationsA;
	let conversationsB;
	let messagesA;
	let messagesB;
	let readResponse;

	step('send dm from alice to bob');
	content = 'e2e hello ' + Date.now();
	sendResponse = await alice.request(
		buildDmSend(userB, content),
		'dm.send.ok'
	);
	pass('alice received dm.send.ok');

	messageId = extractMessageId(sendResponse);
	otherUserId = extractOtherUserId(sendResponse);

	assert(messageId, 'Could not extract messageId from dm.send.ok');
	assert(otherUserId === userB, 'dm.send.ok returned wrong otherUserId');

	pass('messageId=' + messageId);
	pass('otherUserId=' + otherUserId);

	step('bob receives dm.message.new push');
	await bob.waitFor(isDmPushWithContent(content), 5000);
	pass('bob received dm.message.new push');

	step('list alice conversations');
	conversationsA = await alice.request(
		buildDmConversationsList(30),
		'dm.conversations.list.ok'
	);
	assert(contains(conversationsA, userB), 'Alice conversations do not include Bob');
	assert(contains(conversationsA, content), 'Alice conversations do not include last message content');
	pass('alice conversation list contains Bob and last message');

	step('list bob conversations');
	conversationsB = await bob.request(
		buildDmConversationsList(30),
		'dm.conversations.list.ok'
	);
	assert(contains(conversationsB, content), 'Bob conversations do not include last message content');
	pass('bob conversation list contains last message');

	step('list alice messages with bob');
	messagesA = await alice.request(
		buildDmMessagesList(userB, 30),
		'dm.messages.list.ok'
	);
	assert(contains(messagesA, content), 'Alice messages do not include sent content');
	assert(contains(messagesA, messageId), 'Alice messages do not include messageId');
	pass('alice messages contain sent message');

	step('list bob messages with alice');
	messagesB = await bob.request(
		buildDmMessagesList(alice.userId, 30),
		'dm.messages.list.ok'
	);
	assert(contains(messagesB, content), 'Bob messages do not include sent content');
	assert(contains(messagesB, messageId), 'Bob messages do not include messageId');
	pass('bob messages contain received message');

	step('bob marks conversation as read');
	readResponse = await bob.request(
		buildDmRead(alice.userId, messageId),
		'dm.read.ok'
	);
	assert(readResponse.data, 'dm.read.ok has no data object');
	assert(readResponse.data.otherUserId === alice.userId, 'dm.read.ok returned wrong otherUserId');
	assert(readResponse.data.readUpToMessageId === messageId, 'dm.read.ok returned wrong readUpToMessageId');
	pass('bob marked conversation as read');

	return {
		content,
		messageId
	};
}

async function testNotificationsFlow(bob) {
	let notificationsResponse;
	let notifications;
	let notificationId;
	let readResponse;
	let deleteResponse;

	step('list notifications');
	notificationsResponse = await bob.request(
		buildNotificationsList(30),
		'notifications.list.ok'
	);
	assert(notificationsResponse.data, 'notifications.list.ok has no data object');
	notifications = extractNotifications(notificationsResponse);
	pass('notifications.list.ok received, count=' + notifications.length);

	if (notifications.length === 0) {
		console.log('[SKIP] no notification available for read/delete');
		return;
	}

	notificationId = extractNotificationId(notifications[0]);
	if (!notificationId) {
		console.log('[SKIP] first notification has no notificationId');
		return;
	}

	step('mark first notification as read');
	readResponse = await bob.request(
		buildNotificationsRead([notificationId]),
		'notifications.read.ok'
	);
	assert(readResponse.data, 'notifications.read.ok has no data object');
	assert(typeof readResponse.data.updatedCount === 'number', 'notifications.read.ok updatedCount is not a number');
	pass('notifications.read.ok updatedCount=' + readResponse.data.updatedCount);

	step('delete first notification');
	deleteResponse = await bob.request(
		buildNotificationsDelete([notificationId]),
		'notifications.delete.ok'
	);
	assert(deleteResponse.data, 'notifications.delete.ok has no data object');
	assert(typeof deleteResponse.data.deletedCount === 'number', 'notifications.delete.ok deletedCount is not a number');
	pass('notifications.delete.ok deletedCount=' + deleteResponse.data.deletedCount);
}

async function main() {
	let userA;
	let userB;
	let userC;
	let alice;
	let bob;
	let charlie;

	userA = getUser('WS_TEST_USER_A_ID', process.env.WS_TEST_USER_ID || DEFAULT_USER_A);
	userB = getUser('WS_TEST_USER_B_ID', DEFAULT_USER_B);
	userC = getUser('WS_TEST_USER_C_ID', DEFAULT_USER_C);

	alice = new WsClient('alice', userA);
	bob = new WsClient('bob', userB);
	charlie = new WsClient('charlie', userC);

	try {
		await testAuth(alice, bob, charlie);
		await testDmFlow(alice, bob, userB);
		await testNotificationsFlow(bob);

		console.log('\n[SUCCESS] websocket e2e scenario completed');
	} finally {
		await alice.close();
		await bob.close();
		await charlie.close();
	}
}

main().catch((error) => {
	console.error('\n[FAIL]', error.message);
	process.exit(1);
});