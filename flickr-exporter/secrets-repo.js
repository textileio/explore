const Path = require("path");
const Fs = require("fs");

class SecretsRepo {
  constructor() {
    this.data = null;
    this.filePath = Path.resolve(__dirname, ".secrets.json");
  }

  getData() {
    if (!this.data && Fs.existsSync(this.filePath)) {
      const raw = Fs.readFileSync(this.filePath);
      this.data = JSON.parse(raw) || {};
    }
    return this.data || {};
  }

  getOAuthToken() {
    return this.getData().oauthToken;
  }

  getOAuthTokenSecret() {
    return this.getData().oauthTokenSecret;
  }

  set(token, tokenSecret) {
    const data = this.getData();
    data.oauthToken = token;
    data.oauthTokenSecret = tokenSecret;
    this.data = data;

    const raw = JSON.stringify(this.data);
    Fs.writeFileSync(this.filePath, raw);
  }
}

module.exports = SecretsRepo;
