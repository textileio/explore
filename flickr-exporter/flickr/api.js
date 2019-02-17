const Flickr = require("flickr-sdk");
const EventEmitter = require("events");
const readline = require("readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const api = (function API() {
  let userAuth = null;
  let simpleAuth = null;

  function question(msg) {
    return new Promise(function(resolve, reject) {
      rl.question(msg, line => line);
    });
  }

  return {
    async getUserAuth($this) {
      if (userAuth) return userAuth;

      const oauth = new Flickr.OAuth($this.consumerKey, $this.consumerSecret);

      try {
        if ($this.oauthToken) {
          console.log("Has an oauth token", $this.oauthToken);
          userAuth = new Flickr(
            Flickr.OAuth.createPlugin(
              $this.consumerKey,
              $this.consumerSecret,
              $this.oauthToken,
              $this.oauthTokenSecret
            )
          );
        } else {
          $this.emit("info", { msg: "Requesting authorization token" });
          const { body } = await oauth.request("");
          $this.emit("info", {
            msg: "Authorization token retrieved",
            data: {
              key: $this.consumerKey,
              secret: $this.consumerSecret,
              token: body.oauth_token,
              tokenSecret: body.oauth_token_secret
            }
          });

          userAuth = new Flickr(
            Flickr.OAuth.createPlugin(
              $this.consumerKey,
              $this.consumerSecret,
              body.oauth_token,
              body.oauth_token_secret
            )
          );

          const url = oauth.authorizeUrl(body.oauth_token);
          console.log(`Visit the URL to authorize the app: ${url}`);

          const key = await question("Enter the verification key:  ");
          console.log(`Key Entered: ${key}`);
        }
        // var login = await userAuth.test.login();
        // console.log('login', login);
        return userAuth;
      } catch (err) {
        $this.emit("error", { msg: `Authorization failed. ${err}` });
        throw err;
      }
    },

    getSimpleAuth($this) {
      if (simpleAuth) return simpleAuth;
      simpleAuth = new Flickr($this.consumerKey);
      return simpleAuth;
    }
  };
})();

class FlickrAPI extends EventEmitter {
  constructor(options) {
    super();
    this.name = "flickr (TM)";
    this.username = options.username;
    this.consumerKey = options.apiKey;
    this.consumerSecret = options.apiSecret;
    this.oauthToken = options.oauthToken;
    this.oauthTokenSecret = options.oauthTokenSecret;
  }

  async getUser() {
    try {
      this.emit("info", { msg: `Requesting user '${this.username}'` });

      const { body } = await api.getSimpleAuth(this).people.findByUsername({
        username: this.username
      });
      this.emit("info", {
        msg: `Found info for user '${this.username}'`
      });
      return body.user.nsid;
    } catch (err) {
      this.emit("error", {
        msg: `Unable to find user '${this.username}'`
      });
      throw err;
    }
  }

  async getUserPhotos(options) {
    try {
      this.emit("info", { msg: `Getting a list of user photos` });

      const flickr = await api.getUserAuth(this);
      const { body } = await flickr.people.getPhotos(options);
      this.emit("info", {
        msg: `Found photos for user`,
        data: body
      });
      return body;
    } catch (err) {
      this.emit("error", {
        msg: `Unable to get user photos`
      });
      throw err;
    }
  }

  async getPhoto(id) {
    const flickr = await api.getUserAuth(this);
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
      height: original.height
    };
  }

  async getPhotoList(pageNum) {
    const nsid = await this.getUser(); // TODO Cache this

    const { photos } = await this.getUserPhotos({
      user_id: nsid,
      page: pageNum
    });

    const { photo, page, pages } = photos;
    for (let i = 0; i < photo.length; i += 1) {
      // TODO This stuff could definitely be grouped
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
