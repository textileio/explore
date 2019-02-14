const Connection = require("../core/connection");

function getArgs(argsAr) {
  if (!args || !args.length) {
    return "";
  }
  return argsAr.map(ar => ar.toString());
}

function getOpts(opts) {
  if (!opts) {
    return "";
  }
  return Object.keys(opts).map(key => `${key}=${opts[key]}`);
}

/**
 * API is a base API module
 */
class API {
  constructor(opts) {
    this.opts = opts;
  }

  con() {
    return Connection.get(this.opts);
  }

  createHeaders(args, opts) {
    // TODO Make more robust
    return {
      "X-Textile-Args": getArgs(args),
      "X-Textile-Opts": getOpts(opts)
    };
  }
}

module.exports = API;
