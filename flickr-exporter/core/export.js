const { EventEmitter2 } = require("eventemitter2");

class Export extends EventEmitter2 {
  constructor(api) {
    super();
    this.api = api;
    this.name = api.name;

    this.api.onAny((e, v) => this.emit(e, v));
  }

  async run(onPhotoFound) {
    let hasMore = true;
    let curPage = 1;

    try {
      this.emit("info", { msg: `Starting a ${this.name} export` });
      while (hasMore) {
        // This could all be done asynchronously as a bunch, but I'm not sure
        // if that is desired
        const { photos: photoList, page, pages } = await this.api.getPhotoList(
          curPage
        );
        curPage += 1;
        hasMore = page < pages;

        for (let i = 0; i < photoList.length; i += 1) {
          const photo = photoList[i];
          if (onPhotoFound) {
            onPhotoFound(photo);
          }
        }
      }
      this.emit("info", {
        msg: `${this.name} export complete`,
        type: "success"
      });
    } catch (err) {
      this.emit("error", {
        msg: `${this.name} export failed`,
        error: err,
        type: "error"
      });
    }
  }
}

module.exports = Export;
