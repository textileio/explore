#!/usr/bin/env node

const path = require("path");
const app = require("commander");
const pkg = require("../package.json");
const Sync = require("../core/sync");
const Logger = require("../logger.js");
const SecretsRepo = require("../secrets-repo");
const Authorizer = require("../flickr/authorizer");
const API = require("../flickr/api");

function incVerbose(v, total) {
  return total + 1;
}

/** runCommand does some shared setup before calling the apiCallback
 *  with as fn (logger, opts)
 */
async function runCommand(cmd, apiCallback) {
  const logger = new Logger(cmd.verbose);
  const opts = {
    apiKey: cmd.apiKey,
    apiSecret: cmd.apiSecret,
    outputDir: cmd.outputDir || path.join(process.cwd(), "export"),
    batchSize: cmd.batchSize || 5,
    authPort: cmd.authPort || 7777
  };
  const secrets = new SecretsRepo(opts);

  opts.secretsRepo = secrets;
  await apiCallback(logger, opts);
}

async function run() {
  app
    .version(pkg.version)
    .description(
      "Transfer personal photos from your Flickr (TM) account into your Textile wallet"
    );

  // Init command
  app
    .command("init")
    .description(
      "initialize the exporter by authorizing your flickr account. (Only needs to be done once.)"
    )
    .option("-k, --api-key [key]", "Your Flickr (TM) API key")
    .option("-s, --api-secret [secret]", "Your Flickr (TM) API secret")
    .option(
      "-o, --output-dir [dir]",
      "The directory in which to save your Flickr (TM) data"
    )
    .option(
      "-p, --auth-port [port]",
      "The authorization callback port. Defaults to 7777"
    )
    .option(
      "-v, --verbose",
      "Output more verbose info to the log",
      incVerbose,
      0
    )
    .action(async cmd => {
      await runCommand(cmd, async (logger, opts) => {
        const authorizer = new Authorizer(opts);
        logger.listen(authorizer);
        await authorizer.init();
      });
    });

  // Sync command
  app
    .command("sync")
    .description(
      "export and then add your photos and comments to a local textile node"
    )
    .option(
      "-o, --output-dir [dir]",
      "The directory in which to save your Flickr (TM) data"
    )
    .option("-b, --batch-size [size]", "Size of the batches to download")
    .option(
      "-v, --verbose",
      "Output more verbose info to the log",
      incVerbose,
      0
    )
    .action(async cmd => {
      await runCommand(cmd, async (logger, opts) => {
        const api = new API(opts);
        const sync = new Sync(api, opts);
        logger.listen(sync);
        await sync.run();
      });
    });

  // Run
  app.parse(process.argv);

  // Display help if no args were given
  if (!process.argv.slice(2).length) {
    app.outputHelp();
  }
}

run();
