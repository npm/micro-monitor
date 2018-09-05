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

  describe('git hash', () => {
    it('should prefer the value of BUILD_HASH', (done) => {
      process.env.BUILD_HASH = 'feed'
      const monitor = Monitor(9867, () => {
        request.get({
          url: 'http://127.0.0.1:9867/_monitor/status',
          json: true
        }, (err, res, response) => {
          if (err) return done(err)
          res.statusCode.should.equal(200)
          response.git.should.equal('feed')
          monitor.stop().then(done)
        })
      })
    })

    it('should fall back to the head of the current repo', (done) => {
      if (process.env.BUILD_HASH) {
        delete process.env.BUILD_HASH
      }
      const monitor = Monitor(9867, () => {
        request.get({
          url: 'http://127.0.0.1:9999/_monitor/status',
          json: true
        }, (err, res, response) => {
          if (err) return done(err)
          res.statusCode.should.equal(200)
          response.git.should.match(/[0-9a-f]{7}/)
          monitor.stop().then(done)
        })
      })
    })
  })

  describe('halts cleanly', () => {
    it('stop() triggers close()', (done) => {
      let stopped = false
      const close = monitor.close.bind(monitor)
      monitor.close = (closed) => {
        stopped = true
        close(closed)
      }
      monitor.stop().then(() => {
        stopped.should.equal(true)
        done()
      })
    })
  })
})
