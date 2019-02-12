const Connection = require('../core/connection')

/**
 * Peer is an API module for getting basic information about a Textile node
 */
class Peer {
	constructor(opts) {
		this.name = 'peer' // required for module interface
		this.opts = opts
	}

	/** get retrieves the peer id of a Textile node */
	async get() {
	  return await this.con().get('/api/v0/peer')
	}

	async address() {
	  return await this.con().get('/api/v0/address')
	}
	
	async ping() {
	  return await this.con().get('/api/v0/ping')
	}

	con() {
		return Connection.get(this.opts)
	}
}

module.exports = Peer
