#!/usr/bin/env node

const app = require('commander');
const pkg = require('./package.json');
const exportFunc = require('./cmd/export');

app
	.version(pkg.version)
	.description('Transfer personal photos from your flickr (TM) account into your Textile wallet');

// Export command
var exportCmd = app.command('export', 'export your flickr (TM) photos');
addUserOpts(exportCmd);
exportCmd.action(exportFunc);

// Run
app.parse(process.argv);

// Options
function addUserOpts(cmd) {
	return cmd
		.option('-k, --api-key [key]', 'Your flickr (TM) API key')
		.option('-s, --api-secret [secret]', 'Your flickr (TM) API secret')
		.option('-u, --username [username]', 'Your flickr (TM) username')
		.option('-b, --bin [path]', 'Non-standard bin/exe path');
		//.option('-p, --port', 'Textile API port')
		//.option('-a, --oauth', '')
}
