const expect = require('chai').expect
const Textile = require('../index')

describe('client module object', () => {
	it('should contain peer module', () => {
		let textile = new Textile()
		expect(textile).to.have.property('peer')
	})
})
