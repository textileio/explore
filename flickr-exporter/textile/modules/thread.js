const API = require("../core/api.js");

/**
 * Thread is an API module for managing Textile threads
 */
class Thread extends API {
  constructor(opts) {
    super(opts);
    this.name = "thread"; // required for module interface
    this.opts = opts;
  }

  /** get retrieve a list of threads */
  async get() {
    return this.con().get("/api/v0/threads");
  }

  async add(name, options) {
    return this.con().post("/api/v0/threads", {
      headers: this.getHeaders([name], options)
    });
  }
}

module.exports = Thread;
