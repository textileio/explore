#!/usr/bin/env node

const app = require("commander");
const pkg = require("./package.json");
const Flickr = require("./flickr/api");
const Export = require("./core/export");
const Sync = require("./core/sync");
const Logger = require("./logger.js");
const SecretsRepo = require("./secrets-repo");

function incVerbose(v, total) {
  return total + 1;
}

/** runCommand does some shared setup before calling the apiCallback
 *  with as fn (logger, api)
 */
async function runCommand(cmd, apiCallback) {
  const logger = new Logger(cmd.verbose);
  const secrets = new SecretsRepo();
  const opts = {
    ...cmd,
    secretsRepo: secrets,
    onVerifyUrl: async url => {
      await logger.question(
        `Please visit this page to authorize this app: ${url}`
      );
    }
  };

  const api = new Flickr(opts);
  await apiCallback(logger, api);
}

async function run() {
  app
    .version(pkg.version)
    .description(
      "Transfer personal photos from your Flickr (TM) account into your Textile wallet"
    );

  // Export command
  app
    .command("export")
    .description(
      "export your Flickr (TM) photos and comments to a local directory"
    )
    .option("-k, --api-key [key]", "Your Flickr (TM) API key")
    .option("-s, --api-secret [secret]", "Your Flickr (TM) API secret")
    .option("-u, --username [username]", "Your Flickr (TM) username")
    .option(
      "-v, --verbose",
      "Output more verbose info to the log",
      incVerbose,
      0
    )
    .action(async cmd => {
      await runCommand(cmd, async (logger, api) => {
        const exp = new Export(api);
        logger.listen(exp);
        await exp.run();
      });
    });

  app
    .command("sync")
    .description(
      "export and then add your photos and comments to a local textile node"
    )
    .option("-k, --api-key [key]", "Your Flickr (TM) API key")
    .option("-s, --api-secret [secret]", "Your Flickr (TM) API secret")
    .option("-u, --username [username]", "Your Flickr (TM) username")
    .option(
      "-v, --verbose",
      "Output more verbose info to the log",
      incVerbose,
      0
    )
    .action(async cmd => {
      await runCommand(cmd, async (logger, api) => {
        const sync = new Sync(api);
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
