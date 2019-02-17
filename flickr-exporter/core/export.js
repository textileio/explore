const EventEmitter = require("events");

class Export extends EventEmitter {
  constructor(api) {
    super();
    this.api = api;
    this.name = api.name;
  }

  async run() {
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
          this.emit("photo.found", photoList[i]);
        }
      }
    } catch (err) {
      this.emit("error", { msg: `${this.name} export failed`, error: err });
    }
  }
}

module.exports = Export;
