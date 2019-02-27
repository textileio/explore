const { EventEmitter2 } = require("eventemitter2");
const Flickr = require("flickr-sdk");

const userAuth = new WeakMap();
const simpleAuth = new WeakMap();

class Auth extends EventEmitter2 {
  constructor(options) {
    super();
    this.secretsRepo = options.secretsRepo;
    this.onVerifyUrl = options.onVerifyUrl;
    this.consumerKey = options.apiKey;
    this.consumerSecret = options.apiSecret;
  }

  async verifyUserAuth() {
    const oauth = new Flickr.OAuth(this.consumerKey, this.consumerSecret);
    const url = await oauth.authorizeUrl(this.oauthToken);
    return this.onVerifyUrl(url);
  }

  async ensureUserAuth(uAuth, userId) {
    this.emit("auth.token.checking", { msg: "Checking oauth token", lvl: 2 });
    try {
      // Just do a random secured endpoint hit to see if it works
      await uAuth.people.getPhotos({ user_id: userId });
    } catch (er) {
      this.emit("auth.token.unauthorized", {
        msg: "Random secured endpoint test failed",
        lvl: 2,
        error: er
      });
      try {
        await this.verifyUserAuth();
      } catch (e) {
        // Reset so that it works the next time around
        userAuth.set(this, null);
        await this.getUserAuth();
        this.authToken = null;
        this.authTokenSecret = null;
      }
    }
  }

  createUserPlugin() {
    userAuth.set(
      this,
      new Flickr(
        Flickr.OAuth.createPlugin(
          this.consumerKey,
          this.consumerSecret,
          this.oauthToken,
          this.oauthTokenSecret
        )
      )
    );
  }

  async getUserAuth(userId) {
    if (userAuth.get(this)) return userAuth.get(this);

    const oauth = new Flickr.OAuth(this.consumerKey, this.consumerSecret);
    this.oauthToken = this.secretsRepo.getOAuthToken();
    this.oauthTokenSecret = this.secretsRepo.getOAuthTokenSecret();

    try {
      if (this.oauthToken) {
        this.emit("auth.token.found", {
          msg: "Using existing authorization token",
          lvl: 2
        });

        this.createUserPlugin();
      } else {
        this.emit("auth.token.requesting", {
          msg: "Requesting authorization token",
          lvl: 2
        });

        const {
          body: { oauth_token: token, oauth_token_secret: secret }
        } = await oauth.request("");

        this.emit("auth.token.received", {
          msg: "OAuth token received",
          lvl: 2,
          data: {
            token,
            secret
          }
        });

        this.oauthToken = token;
        this.oauthTokenSecret = secret;
        this.secretsRepo.set(token, secret);
        this.createUserPlugin();
      }

      await this.ensureUserAuth(userAuth.get(this), userId);
      return userAuth.get(this);
    } catch (err) {
      this.emit("auth.token.failed", {
        msg: `Authorization failed. ${err}`
      });
      throw err;
    }
  }

  getSimpleAuth() {
    if (simpleAuth.get(this)) return simpleAuth.get(this);
    simpleAuth.set(this, new Flickr(this.consumerKey));
    return simpleAuth.get(this);
  }
}

module.exports = Auth;
