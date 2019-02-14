#!/usr/bin/env node

const app = require("commander");
const pkg = require("./package.json");
const exportFunc = require("./cmd/export");

function run() {
  app
    .version(pkg.version)
    .description(
      "Transfer personal photos from your flickr (TM) account into your Textile wallet"
    );

  // Export command
  app
    .command("export")
    .option("-k, --api-key [key]", "Your flickr (TM) API key")
    .option("-s, --api-secret [secret]", "Your flickr (TM) API secret")
    .option("-u, --username [username]", "Your flickr (TM) username")
    .action(c => exportFunc(c));

  // Run
  app.parse(process.argv);
}

run();
