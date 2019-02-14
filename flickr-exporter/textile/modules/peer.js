const API = require("../core/api.js");

/**
 * Peer is an API module for getting basic information about a Textile node
 */
class Peer extends API {
  constructor(opts) {
    super(opts);
    this.name = "peer"; // required for module interface
    this.opts = opts;
  }

  /** get retrieves the peer id of a Textile node */
  async get() {
    return this.con().get("/api/v0/peer");
  }

  async address() {
    return this.con().get("/api/v0/address");
  }

  async ping() {
    return this.con().get("/api/v0/ping");
  }
}

module.exports = Peer;
