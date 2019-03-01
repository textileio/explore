const { EventEmitter2 } = require("eventemitter2");
const uuid = require("uuid/v4");
const Path = require("path");
const Fs = require("fs");
const Axios = require("axios");
const Flickr = require("flickr-sdk");

async function download(url, path) {
  if (Fs.existsSync(path)) {
    return new Promise(resolve => resolve());
  }

  const writer = Fs.createWriteStream(path);

  const resp = await Axios({
    url,
    method: "GET",
    responseType: "stream"
  });

  resp.data.pipe(writer);

  return new Promise((resolve, reject) => {
    writer.on("finish", resolve);
    writer.on("error", reject);
  });
}

class FlickrAPI extends EventEmitter2 {
  constructor(options) {
    super();
    this.name = "Flickr (TM)";
    this.api = null;
    this.secretsRepo = options.secretsRepo;
    this.outputDir = options.outputDir;
    this.batchSize = options.batchSize;
    this.user = undefined;
  }

  init() {
    if (this.api) {
      return true;
    }

    this.user = this.secretsRepo.getUser();
    if (!this.user) {
      this.emit("user.missing", {
        msg: "No user was found. Please run the 'init' command and try again.",
        type: "error"
      });
      return false;
    }
    this.api = new Flickr(
      Flickr.OAuth.createPlugin(
        this.user.consumerKey,
        this.user.consumerSecret,
        this.user.token,
        this.user.tokenSecret
      )
    );
    return true;
  }

  async getUserPhotos(options) {
    if (!this.init()) {
      return null;
    }

    try {
      this.emit("photolist.requesting", {
        msg: `Getting a list of user photos`,
        lvl: 1
      });

      const { body } = await this.api.people.getPhotos(options);
      this.emit("photolist.received", {
        msg: `Found photos for user`,
        lvl: 1,
        type: "success",
        data: body
      });
      return body;
    } catch (err) {
      this.emit("photolist.error", {
        msg: `Unable to get user photos`
      });
      throw err;
    }
  }

  async getPhoto(id) {
    if (!this.init()) {
      return null;
    }

    const infoResp = await this.api.photos.getInfo({ photo_id: id });
    const info = infoResp.body.photo;
    const {
      body: {
        sizes: { size, candownload }
      }
    } = await this.api.photos.getSizes({ photo_id: id });
    const {
      body: { comments }
    } = await this.api.photos.comments.getList({ photo_id: id });

    let original = {};

    for (let i = 0; i < size.length; i += 1) {
      const photo = size[i];
      if (photo.label === "Original") {
        original = photo;
        break;
      }
    }

    const instanceID = uuid();
    const path = Path.resolve(this.outputDir, `${info.id}.jpg`);

    this.emit("photo.download.start", {
      msg: `Starting download of photo '${info.title._content}'`,
      instance: instanceID
    });
    await download(original.source, path);
    this.emit("photo.download.complete", {
      msg: `Completed download of photo '${info.title._content}'`,
      instance: instanceID,
      type: "complete"
    });

    return {
      id: info.id,
      dateuploaded: info.dateuploaded,
      rotation: info.rotation,
      title: info.title,
      description: info.description,
      taken: info.dates.taken,
      posted: info.dates.posted,
      comments,
      tags: info.tags,
      canDownload: candownload,
      source: original.source,
      width: original.width,
      height: original.height,
      path
    };
  }

  async getPhotoList(pageNum) {
    if (!this.init()) {
      return null;
    }

    const photos = [];

    const {
      photos: { photo, page, pages }
    } = await this.getUserPhotos({
      user_id: this.user.nsid,
      page: pageNum,
      per_page: this.batchSize
    });

    for (let i = 0; i < photo.length; i += 1) {
      // If desired, this could be grouped so that the requests all
      // fire off in a group for better performance
      const photoInfo = await this.getPhoto(photo[i].id);
      photos.push(photoInfo);
    }

    return {
      page,
      pages,
      photos
    };
  }
}

module.exports = FlickrAPI;
