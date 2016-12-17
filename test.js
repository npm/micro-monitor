/* global describe, it, before */

require('chai').should()

const monitor = require('./')
const request = require('request')

describe('micro-monitor', () => {
  before((done) => monitor(9999, done))

  it('responds with status information', (done) => {
    request.get({
      url: 'http://127.0.0.1:9999/_monitor/status',
      json: true
    }, (err, res, status) => {
      if (err) return done(err)
      res.statusCode.should.equal(200)
      // should return an object representing memory usage.
      ;(typeof status.rss).should.equal('object')
      return done()
    })
  })
})
