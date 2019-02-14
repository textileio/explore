const Flickr = require("flickr-sdk");
const { Signale } = require("signale");

async function getUserAuth(consumerKey, consumerSecret) {
  const log = new Signale({ interactive: true });
  const oauth = new Flickr.OAuth(consumerKey, consumerSecret);

  try {
    log.await("Requesting authorization token");
    const { body } = await oauth.request("");
    log.success(
      "Authorization token retrieved",
      body.oauth_token,
      body.oauth_token_secret
    );

    return Flickr.OAuth.createPlugin(
      consumerKey,
      consumerSecret,
      body.oauth_token,
      body.oauth_token_secret
    );
  } catch (err) {
    log.error(`Authorization failed. ${err}`);
    throw err;
  }
}

async function getUser(flickr, key, username) {
  const log = new Signale({ interactive: true });

  try {
    log.await(`Requesting user '${username}'`);
    const { body } = await flickr.people.findByUsername({
      username
    });
    log.success(`Found info for user '${username}'`, body);
  } catch (err) {
    log.error(`Unable to find user '${username}'`);
    throw err;
  }
}

/*
 * Command to export flickr (TM) photos
 */
async function exportCmd(cmd) {
  const log = new Signale();

  try {
    log.note("Running an export");
    log.debug(`Your name is ${cmd.username}, api key: ${cmd.apiKey}`);

    const userAuth = await getUserAuth(cmd.apiKey, cmd.apiSecret);
    const flickr = new Flickr(userAuth);
    const { body } = await flickr.test.login();
    log.success("body", body);
    // await getUser(flickr, cmd.apiKey, cmd.username);
  } catch (err) {
    log.error(err);
  }

  // const flickr = new Flickr(cmd.apiKey);

  // flickr.photos
  //  .getInfo({
  //    photo_id: 25825763
  //  })
  //  .then(function(res) {
  //    console.log("yay", res.body);
  //  })
  //  .catch(function(err) {
  //    console.error("bonk", err);
  //  });
}

module.exports = exportCmd;
