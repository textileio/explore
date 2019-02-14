const Peer = require("./modules/peer");
// const Profile = require('./modules/profile'),
// const Mills = require('./modules/mills'),
// const Threads = require('./modules/threads'),
// const Blocks = require('./modules/blocks'),
// const Messages = require('./modules/messages'),
// const Files = require('./modules/files'),
// const Keys = require('./modules/keys'),
// const Sub = require('./modules/sub'),
// const Invites = require('./modules/invites'),
// const Notifications = require('./modules/notifications'),
// const Cafes = require('./modules/cafes'),
// const Swarm = require('./modules/swarm'),
// const Contacts = require('./modules/contacts'),
// const IPFS = require('./modules/ipfs'),
// const Confg = require('./modules/config'),

class Textile {
  constructor(options) {
    this.opts = options || {};
    this.peer = new Peer(this.opts);
  }
}

module.exports = Textile;
