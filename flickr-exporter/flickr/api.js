const { EventEmitter2 } = require("eventemitter2");
const uuid = require("uuid/v4");
const Path = require("path");
const Fs = require("fs");
const Axios = require("axios");
const Auth = require("./auth");

function ensureDir(path) {
  const dirname = Path.dirname(path);
  if (!Fs.existsSync(dirname)) {
    Fs.mkdirSync(dirname);
  }
}

async function download(url, path) {
  ensureDir(path);
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

const userId = new WeakMap();

class FlickrAPI extends EventEmitter2 {
  constructor(options) {
    super();
    this.name = "Flickr (TM)";
    this.username = options.username;

    this.auth = new Auth(options);
    this.auth.onAny((e, v) => this.emit(e, v));
  }

  async getUser() {
    try {
      this.emit("user.requesting", {
        msg: `Requesting user '${this.username}'`,
        lvl: 1
      });

      const { body } = await this.auth.getSimpleAuth().people.findByUsername({
        username: this.username
      });
      this.emit("user.received", {
        msg: `Found info for user '${this.username}'`,
        type: "success",
        lvl: 1,
        data: body
      });
      return body.user.nsid;
    } catch (err) {
      this.emit("user.error", {
        msg: `Unable to find user '${this.username}'`
      });
      throw err;
    }
  }

  async getUserPhotos(options) {
    try {
      this.emit("photolist.requesting", {
        msg: `Getting a list of user photos`,
        lvl: 1
      });

      const flickr = await this.auth.getUserAuth(options.user_id);

      const { body } = await flickr.people.getPhotos(options);
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

  async getPhoto(nsid, id) {
    const flickr = await this.auth.getUserAuth(nsid);
    const infoResp = await flickr.photos.getInfo({ photo_id: id });
    const info = infoResp.body.photo;
    const {
      body: {
        sizes: { size, candownload }
      }
    } = await flickr.photos.getSizes({ photo_id: id });
    const {
      body: { comments }
    } = await flickr.photos.comments.getList({ photo_id: id });

    let original = {};

    for (let i = 0; i < size.length; i += 1) {
      const photo = size[i];
      if (photo.label === "Original") {
        original = photo;
        break;
      }
    }

    const instanceID = uuid();
    const path = Path.resolve(process.cwd(), "exported", info.id);
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
    const photos = [];
    let nsid = userId.get(this);
    if (!nsid) {
      nsid = await this.getUser();
      userId.set(this, nsid);
    }

    const {
      photos: { photo, page, pages }
    } = await this.getUserPhotos({
      user_id: nsid,
      page: pageNum
    });

    for (let i = 0; i < photo.length; i += 1) {
      // If desired, this could be grouped so that the requests all
      // fire off in a group for better performance
      const photoInfo = await this.getPhoto(nsid, photo[i].id);
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
