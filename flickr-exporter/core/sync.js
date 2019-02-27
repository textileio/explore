const { EventEmitter2 } = require("eventemitter2");
const Fs = require("fs");
const Textile = require("js-textile-http-client");
const Exp = require("./export");

class Sync extends EventEmitter2 {
  constructor(api, options) {
    super();
    this.api = api;
    this.exp = new Exp(api);
    this.textile = new Textile(options);

    this.exp.onAny((e, v) => this.emit(e, v));
  }

  async createThread(name) {
    this.emit("schema.finding", {
      msg: `Attempting to locate the textile default 'media' schema`,
      lvl: 1
    });
    const mediaSchema = await this.textile.schema.getByName("media");
    if (!mediaSchema) {
      throw new Error("Unable to create thread. Media schema is missing");
    }

    const thrd = await this.textile.thread.getByName(name);
    if (thrd) {
      return thrd;
    }

    this.emit("thread.creating", {
      msg: `Creating new textile thread '${name}'`,
      lvl: 1
    });
    return this.textile.thread.add(name, {
      schema: mediaSchema.id,
      type: "open",
      sharing: "shared"
    });
  }

  async addComments(savedId, comments) {
    if (comments && comments.comment) {
      const cmntAr = comments.comment;
      for (let i = 0; i < cmntAr.length; i += 1) {
        const comment = cmntAr[i];
        if (comment._content) {
          this.emit("comment.attach", {
            msg: "Attaching a comment to a photo in textile",
            lvl: 1,
            data: comment
          });
          await this.textile.block.addComment(savedId, comment._content);
        }
      }
    }
  }

  async addPhoto(thread, photo) {
    try {
      this.emit("photo.add", {
        msg: `Adding photo ${photo.id} to textile thread '${thread.name}'`
      });

      const stream = Fs.createReadStream(photo.path);
      const saved = await this.textile.thread.addFileStream(
        thread.id,
        stream,
        photo.name,
        {
          caption: photo.title._content
        }
      );
      console.log("saved", saved);

      await this.addComments(saved.id, photo.comments);
    } catch (er) {
      this.emit("photo.error", {
        msg: `An error occurred while adding photo #${photo.id}`,
        error: er
      });
      // We could re-throw here and end the process, or not catch at all,
      // but this seems like it would be undesirable for a long export
    }
  }

  async run() {
    try {
      const thread = await this.createThread(`${this.api.name} Export`);

      await this.exp.run(photo => this.addPhoto(thread, photo));

      this.emit("sync.complete", {
        msg: `${this.api.name} sync completed successfully`,
        type: "success"
      });
    } catch (er) {
      this.emit("sync.error", {
        msg: `An error occurred during the ${this.api.name} sync`,
        error: er
      });
    }
  }
}

module.exports = Sync;
