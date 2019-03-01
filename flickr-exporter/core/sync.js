const { EventEmitter2 } = require("eventemitter2");
const FormData = require("form-data");
const Fs = require("fs");
const Textile = require("../deps/js-textile-http-client");
const Exp = require("./export");

class Sync extends EventEmitter2 {
  constructor(api, options) {
    super();
    this.name = api.name;
    this.exp = new Exp(api);
    this.textile = new Textile(options);

    this.exp.onAny((e, v) => this.emit(e, v));
  }

  async createThread(name) {
    this.emit("schema.finding", {
      msg: `Attempting to locate the textile default 'media' schema`,
      lvl: 1
    });
    const mediaSchema = await this.textile.schemas.getByName("media");
    if (!mediaSchema) {
      throw new Error("Unable to create thread. Media schema is missing");
    }

    const thrd = await this.textile.threads.getByName(name);
    if (thrd) {
      return thrd;
    }

    this.emit("thread.creating", {
      msg: `Creating new textile thread '${name}'`,
      lvl: 1
    });
    return this.textile.threads.add(name, {
      schema: mediaSchema.id,
      type: "open",
      sharing: "shared"
    });
  }

  async addComments(savedId, comments) {
    if (comments && comments.comment) {
      const cmntAr = comments.comment;
      for (let i = 0; i < cmntAr.length; i += 1) {
        const { _content: cmnt, realname } = cmntAr[i];
        if (cmnt) {
          this.emit("comment.attach", {
            msg: "Attaching a comment to a photo in textile",
            lvl: 1,
            data: cmnt
          });
          await this.textile.blocks.addComment(
            savedId,
            `[${realname}] ${cmnt}`
          );
        }
      }
    }
  }

  async addPhoto(thread, photo) {
    try {
      this.emit("photo.add", {
        msg: `Adding photo ${photo.id} to textile thread '${thread.name}'`,
        data: photo
      });

      const saved = await this.textile.threads.addFile(
        thread.id,
        () => {
          const stream = Fs.createReadStream(photo.path);
          const form = new FormData();
          form.append("file", stream, photo.path);
          return form;
        },
        photo.name,
        {
          caption: photo.title._content
        }
      );

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
      const thread = await this.createThread(`${this.name} Export`);

      await this.exp.run(async photo => this.addPhoto(thread, photo));

      this.emit("sync.complete", {
        msg: `${this.name} sync completed`,
        type: "success"
      });
    } catch (er) {
      this.emit("sync.error", {
        msg: `An error occurred during the ${this.name} sync`,
        error: er
      });
    }
  }
}

module.exports = Sync;
