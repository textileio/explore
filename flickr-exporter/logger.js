const readline = require("readline");
const { Signale } = require("signale");

const DEBUG = 1;

class Logger {
  constructor(level) {
    this.level = level || 0;

    this.loggers = {};
    this.log = new Signale();
  }

  getInteractive(instanceId) {
    if (!this.loggers[instanceId]) {
      // Hack to account for signale issue
      this.log.note("");
      process.stdout.moveCursor(0, -1);
      this.loggers[instanceId] = new Signale({ interactive: true });
    }
    return this.loggers[instanceId];
  }

  destroyInteractive(instanceId) {
    // this.loggers[instanceId].endInteractive();
    delete this.loggers[instanceId];
  }

  question(msg) {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      terminal: false
    });

    return new Promise(resolve => {
      this.log.note(msg);
      rl.question("Press enter to continue: ", typed => {
        rl.close();
        return resolve(typed);
      });
    });
  }

  write(wtr, type, info) {
    const { msg, data, error } = info;
    let newType = type;
    if (error) {
      wtr.error(error);
      newType = "error";
      if (error.response && error.response.data) {
        wtr.error(error.response.data);
      }
    }

    if (data && this.level >= DEBUG) {
      wtr[newType](msg, data);
    } else {
      wtr[newType](msg);
    }
  }

  listen(ee) {
    ee.onAny(async (e, v) => {
      if (!v.lvl || v.lvl <= this.level) {
        if (v.instance) {
          const lg = this.getInteractive(v.instance);
          const type = v.type || "await";
          this.write(lg, type, v);

          if (v.end || v.type === "complete" || v.type === "error") {
            this.destroyInteractive(v.instance);
          }
        } else {
          const type = v.type || "note";
          this.write(this.log, type, v);
        }
      }
    });
  }
}

module.exports = Logger;
