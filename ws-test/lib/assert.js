function assert(condition, message) {
	if (!condition)
		throw new Error(message);
}

function pass(message) {
	console.log('[PASS]', message);
}

function step(message) {
	console.log('\n[STEP]', message);
}

module.exports = {
	assert,
	pass,
	step
};