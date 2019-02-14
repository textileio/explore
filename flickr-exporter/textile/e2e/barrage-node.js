const Textile = require("../index");

const client = new Textile({
  url: "http://127.0.0.1",
  port: 40600
});

client.peer
  .get()
  .then(resp => console.log(`GET Peer ID [${resp.status}]: ${resp.data}`));
