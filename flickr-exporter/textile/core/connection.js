const axios = require('axios')

/**
 * The connection module contains utilities for creating connections to a Textile node
 */
class Connection {
	/**
	 * get() coerces the given options into a connection
	 */
	static get(opts) {
		opts = Connection.cleanOpts(opts)

		return axios.create({
			baseURL: `${opts.url}:${opts.port}`, // TODO this is flaky
		})
	}

	static cleanOpts(opts) {
		opts = opts || {}
		opts.url = opts.url || 'http://127.0.0.1'
		opts.port = opts.port || 40600
		return opts
	}
}

module.exports = Connection
