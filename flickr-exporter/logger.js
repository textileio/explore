const { Signale } = require("signale");

class Logger {
  constructor() {
    this.loggers = {};
    this.log = new Signale();
  }

  getInteractive({ scope }) {
    const scp = scope || "default";
    if (!this.loggers[scp]) {
      this.loggers[scp] = new Signale({ interactive: true });
    }
    return this.loggers[scp];
  }

  destroyInteractive({ scope }) {
    delete this.loggers[scope || "default"];
  }

  static write(wtr, type, info) {
    const { msg, data, error } = info;
    if (error) {
      wtr[type](error);
    }

    if (data) {
      wtr[type](msg, data);
    } else {
      wtr[type](msg);
    }
  }

  listen(ee) {
    ee.on("await.start", d => {
      const lg = this.getInteractive(d);
      Logger.write(lg, "await", d);
    });
    ee.on("await.success", d => {
      const lg = this.getInteractive(d);
      Logger.write(lg, "success", d);
      this.destroyInteractive(d);
    });
    ee.on("await.error", d => {
      const lg = this.getInteractive(d);
      Logger.write(lg, "error", d);
      this.destroyInteractive(d);
    });
    ee.on("info", d => {
      Logger.write(this.log, "note", d);
    });
    ee.on("error", d => {
      Logger.write(this.log, "error", d);
    });
  }
}

module.exports = Logger;
