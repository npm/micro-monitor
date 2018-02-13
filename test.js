/* global describe, it, before */

require('chai').should()

const Monitor = require('./')
const request = require('request')

describe('micro-monitor', () => {
  let monitor = null
  before((done) => { monitor = Monitor(9999, done) })

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

  it('responds to ping', (done) => {
    request.get({
      url: 'http://127.0.0.1:9999/_monitor/ping',
      json: true
    }, (err, res, response) => {
      if (err) return done(err)
      res.statusCode.should.equal(200)
      response.should.equal('pong')
      return done()
    })
  })

  it('responds to ping with a custom response if requested', (done) => {
    process.env.PING_RESPONSE = 'custom'
    request.get({
      url: 'http://127.0.0.1:9999/_monitor/ping',
      json: true
    }, (err, res, response) => {
      if (err) return done(err)
      res.statusCode.should.equal(200)
      response.should.equal('custom')
      return done()
    })
  })

  describe('contribute', () => {
    it('allows you to contribute new and exciting keys to the status object', (done) => {
      const obj = {batman: 'rich but grumpy'}
      monitor.contribute(() => {
        return {
          batman: obj.batman
        }
      })

      request.get({
        url: 'http://127.0.0.1:9999/_monitor/status',
        json: true
      }, (err, res, response) => {
        if (err) return done(err)
        monitor.contribute(function () {})
        res.statusCode.should.equal(200)
        response.batman.should.equal('rich but grumpy')
        return done()
      })
    })
  })

  describe('missing endpoint', () => {
    it('still 404s', (done) => {
      request.get({
        url: 'http://127.0.0.1:9999/_monitor/status-but-no-i-kid',
        json: true
      }, (err, res, response) => {
        if (err) return done(err)
        res.statusCode.should.equal(404)
        return done()
      })
    })
  })
})
