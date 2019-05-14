const Path = require("path");
const Fs = require("fs");

class SecretsRepo {
  constructor(opts) {
    this.filePath = Path.resolve(opts.outputDir, ".user.json");
  }

  ensureDir() {
    const dirname = Path.dirname(this.filePath);
    if (!Fs.existsSync(dirname)) {
      Fs.mkdirSync(dirname);
    }
  }

  getUser() {
    this.ensureDir();
    if (Fs.existsSync(this.filePath)) {
      const raw = Fs.readFileSync(this.filePath);
      return JSON.parse(raw);
    }
    return undefined;
  }

  setUser(user) {
    const raw = JSON.stringify(user);
    Fs.writeFileSync(this.filePath, raw);
  }
}

module.exports = SecretsRepo;
