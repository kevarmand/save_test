const {spawnSync} = require('child_process');

function fail(message) {
	console.error(message);
	process.exit(1);
}

function main() {
	const result = spawnSync('node', ['/work/gen-token.js', ...process.argv.slice(2)], {
		encoding: 'utf8'
	});

	if (result.status !== 0)
		fail((result.stderr || result.stdout).trim());

	console.log(JSON.stringify({
		type: 'auth',
		token: result.stdout.trim()
	}));
}

main();