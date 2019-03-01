const Flickr = require("flickr-sdk");
const { EventEmitter2 } = require("eventemitter2");
const Http = require("http");
const Url = require("url");

const responseHTML = `
<html>
  <head>
    <meta charset="UTF-8">
    <title>Authorized!</title>
    <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css" integrity="sha384-ggOyR0iXCbMQv3Xipma34MD+dH/1fQ784/j6cY/iJTQUOhcWr7x9JvoRxT2MZw1T" crossorigin="anonymous">
  <head>
  <body>
    <div class="px-3 py-3 pt-md-5 pb-md-4 mx-auto text-center">
      <h1 class="display-4">Thanks!</h1>
      <p class="lead">
        The Textile export tool is now authorized and ready to work!
      </p>
    </div>
  </body>
</html>`;

class Authorizer extends EventEmitter2 {
  constructor(options) {
    super();
    this.port = options.authPort;
    this.secretsRepo = options.secretsRepo;
    this.consumerKey = options.apiKey;
    this.consumerSecret = options.apiSecret;
    this.outputDir = options.outputDir;
  }

  async getUser(callback) {
    let verifier;
    const oauth = new Flickr.OAuth(this.consumerKey, this.consumerSecret);

    const {
      body: { oauth_token: otoken, oauth_token_secret: osecret }
    } = await oauth.request(`http://localhost:${this.port}`);

    const url = await oauth.authorizeUrl(otoken);

    this.emit("url.received", {
      msg: `Please visit this URL to authorize: ${url}`
    });

    const server = Http.createServer((req, res) => {
      const {
        query: { oauth_verifier: ver }
      } = Url.parse(req.url, true);

      verifier = ver;

      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      res.write(responseHTML);
      res.end();

      server.close();
    }).listen(7777);

    server.on("close", async () => {
      const { body: user } = await oauth.verify(otoken, verifier, osecret);
      await callback(user);
    });
  }

  async init() {
    const user = this.secretsRepo.getUser();
    if (user) {
      this.emit("user.exists", {
        msg: `A user already exists in '${this.outputDir}/.user'.
  If you would like to run this as a new user, please select a different output directory.`
      });
    } else {
      await this.getUser(async usr => {
        await this.secretsRepo.setUser({
          fullName: usr.fullName,
          username: usr.username,
          nsid: usr.user_nsid,
          consumerKey: this.consumerKey,
          consumerSecret: this.consumerSecret,
          token: usr.oauth_token,
          tokenSecret: usr.oauth_token_secret
        });
        this.emit("user.saved", {
          msg: `User '${usr.username}' was successfully saved.`,
          type: "success"
        });
      });
    }
  }
}

module.exports = Authorizer;
