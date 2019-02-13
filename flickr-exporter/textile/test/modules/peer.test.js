const expect = require('chai').expect
const nock = require('nock')
const Peer = require('../../modules/peer')
const responses = require('./responses/peer.json')

let opts = {
  url: 'http://127.0.0.1',
  port: 40600,
  blah: '',
}

const ROOT = `${opts.url}:${opts.port}`

let peer = new Peer(opts)

describe('peer api get', () => {  
  it('should respond with plain text peer id', async () => {
    nock(ROOT)
    .get('/api/v0/peer')
    .reply(200, responses.peer)

    let rsp = await peer.get()
    expect(rsp.data).to.equal('12D3KooWNWU8RkgSacfSnrQMlq9RsdciRx7W1wFAJeVNyhUMdSdP')
  })
})

describe('peer api address', () => {
  it('should respond with plain text address', async () => {
    nock(ROOT)
    .get('/api/v0/address')
    .reply(200, responses.address)

    let rsp = await peer.address()
    expect(rsp.data).to.equal('P9UcFifmikQr591RhgUShlAJd5Sxfcj3W8hrhwYG9oDTButN')
  })
})

describe('peer api ping', () => {
  it('should respond with 400', async () => {
    nock(ROOT)
    .get('/api/v0/ping')
    .reply(400, 'x')

    let err

    try {
      await peer.ping()
    } catch (error) {
      err = error.message
    }

    expect(err).to.equal('Request failed with status code 400')
  })
})
