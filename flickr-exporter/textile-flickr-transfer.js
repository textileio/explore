#!/usr/bin/env node

const app = require("commander");
const pkg = require("./package.json");
const Flickr = require("./flickr/api");
const Export = require("./core/export");
const Logger = require("./logger.js");

function run() {
  const logger = new Logger();

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
    .option("-o, --oauth-token [token]", "Your flickr (TM) oauth token")
    .option(
      "-e, --oauth-token-secret [tokenSecret]",
      "Your flickr (TM) oauth token"
    )
    .action(cmd => {
      const api = new Flickr(cmd);
      logger.listen(api);
      const exp = new Export(api);
      logger.listen(exp);
      exp.run();
    });

  // Run
  app.parse(process.argv);
}

run();
