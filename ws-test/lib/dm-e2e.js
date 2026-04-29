const {WsClient} = require('./ws-client');
const {assert, pass, step} = require('./assert');
const {
	buildDmSend,
	buildDmConversationsList,
	buildDmMessagesList,
	buildDmRead,
	extractData,
	extractMessageId,
	extractMessages,
	extractPage,
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

function getLastMessageId(messages) {
	if (!messages.length)
		return null;
	return messages[messages.length - 1].messageId;
}

async function connectAll(alice, bob, charlie) {
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

async function sendManyMessages(alice, bob, userB, count) {
	let sent;
	let i;
	let content;
	let response;
	let messageId;

	sent = [];
	step('send ' + count + ' messages from alice to bob');
	for (i = 0; i < count; i++) {
		content = 'pagination-msg-' + Date.now() + '-' + i;
		response = await alice.request(
			buildDmSend(userB, content),
			'dm.send.ok'
		);
		messageId = extractMessageId(response);
		assert(messageId, 'dm.send.ok has no messageId for message ' + i);
		sent.push({
			content,
			messageId
		});
		await bob.waitFor(isDmPushWithContent(content), 5000);
		console.log('[OK] sent and pushed #' + i + ' messageId=' + messageId);
	}
	pass(count + ' messages sent and pushed to bob');
	return sent;
}

async function testMessagesPagination(client, otherUserId, sentMessages) {
	let collected;
	let beforeMessageId;
	let pageIndex;
	let response;
	let messages;
	let page;
	let i;
	let expected;

	collected = [];
	beforeMessageId = null;
	pageIndex = 0;

	step('paginate messages limit=5');
	while (pageIndex < 10) {
		response = await client.request(
			buildDmMessagesList(otherUserId, 5, beforeMessageId),
			'dm.messages.list.ok'
		);
		messages = extractMessages(response);
		page = extractPage(response);

		console.log('[PAGE ' + pageIndex + '] count=' + messages.length + ' hasMore=' + page.hasMore + ' nextBeforeMessageId=' + page.nextBeforeMessageId);

		assert(messages.length <= 5, 'page contains more than 5 messages');
		for (const message of messages) {
			if (message.content)
				collected.push(message.content);
		}

		if (!page.hasMore)
			break;
		beforeMessageId = page.nextBeforeMessageId || getLastMessageId(messages);
		assert(beforeMessageId, 'pagination hasMore=true but no next cursor/message id');
		pageIndex++;
	}

	for (i = 0; i < sentMessages.length; i++) {
		expected = sentMessages[i].content;
		assert(collected.includes(expected), 'paginated messages missing: ' + expected);
	}

	pass('pagination retrieved all sent messages');
}

async function testConversationVisibility(alice, bob, charlie, userA, userB, sentMessages) {
	let aliceList;
	let bobList;
	let charlieList;
	let charlieAliceMessages;
	let charlieBobMessages;
	let lastContent;
	let i;

	lastContent = sentMessages[sentMessages.length - 1].content;

	step('alice and bob see their conversation');
	aliceList = await alice.request(buildDmConversationsList(30), 'dm.conversations.list.ok');
	bobList = await bob.request(buildDmConversationsList(30), 'dm.conversations.list.ok');

	assert(contains(aliceList, userB), 'alice conversations do not mention bob');
	assert(contains(aliceList, lastContent), 'alice conversations do not contain last message content');
	assert(contains(bobList, userA), 'bob conversations do not mention alice');
	assert(contains(bobList, lastContent), 'bob conversations do not contain last message content');

	pass('alice and bob conversation lists contain expected last message');

	step('charlie must not see alice/bob conversation');
	charlieList = await charlie.request(buildDmConversationsList(30), 'dm.conversations.list.ok');

	for (i = 0; i < sentMessages.length; i++) {
		assert(!contains(charlieList, sentMessages[i].content), 'charlie conversation list leaks alice/bob content');
		assert(!contains(charlieList, sentMessages[i].messageId), 'charlie conversation list leaks alice/bob messageId');
	}

	charlieAliceMessages = await charlie.request(buildDmMessagesList(userA, 30), 'dm.messages.list.ok');
	for (i = 0; i < sentMessages.length; i++) {
		assert(!contains(charlieAliceMessages, sentMessages[i].content), 'charlie can read alice/bob content through alice');
		assert(!contains(charlieAliceMessages, sentMessages[i].messageId), 'charlie can read alice/bob messageId through alice');
	}

	charlieBobMessages = await charlie.request(buildDmMessagesList(userB, 30), 'dm.messages.list.ok');
	for (i = 0; i < sentMessages.length; i++) {
		assert(!contains(charlieBobMessages, sentMessages[i].content), 'charlie can read alice/bob content through bob');
		assert(!contains(charlieBobMessages, sentMessages[i].messageId), 'charlie can read alice/bob messageId through bob');
	}

	pass('charlie cannot see alice/bob messages');
}

async function testRead(bob, userA, lastMessageId) {
	let response;
	let data;

	step('bob marks conversation as read up to last message');
	response = await bob.request(
		buildDmRead(userA, lastMessageId),
		'dm.read.ok'
	);
	data = extractData(response);

	assert(data.otherUserId === userA, 'dm.read.ok returned wrong otherUserId');
	assert(data.readUpToMessageId === lastMessageId, 'dm.read.ok returned wrong readUpToMessageId');

	pass('bob read marker updated');
}

async function main() {
	let userA;
	let userB;
	let userC;
	let alice;
	let bob;
	let charlie;
	let sentMessages;
	let lastMessage;

	userA = getUser('WS_TEST_USER_A_ID', process.env.WS_TEST_USER_ID || DEFAULT_USER_A);
	userB = getUser('WS_TEST_USER_B_ID', DEFAULT_USER_B);
	userC = getUser('WS_TEST_USER_C_ID', DEFAULT_USER_C);

	alice = new WsClient('alice', userA);
	bob = new WsClient('bob', userB);
	charlie = new WsClient('charlie', userC);

	try {
		await connectAll(alice, bob, charlie);

		sentMessages = await sendManyMessages(alice, bob, userB, 12);
		lastMessage = sentMessages[sentMessages.length - 1];

		await testMessagesPagination(bob, userA, sentMessages);
		await testConversationVisibility(alice, bob, charlie, userA, userB, sentMessages);
		await testRead(bob, userA, lastMessage.messageId);

		console.log('\n[SUCCESS] DM e2e scenario completed');
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