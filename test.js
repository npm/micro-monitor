/* global describe, it, before */

require('chai').should()

const expect = require('chai').expect
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

  it('responds with ping', (done) => {
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

  describe('monitorKey', () => {
    it('allows an arbitrary key on an object to be monitored', (done) => {
      const obj = {batman: 'rich but grumpy'}
      monitor.monitorKey(obj, 'batman')

      request.get({
        url: 'http://127.0.0.1:9999/_monitor/status',
        json: true
      }, (err, res, response) => {
        if (err) return done(err)
        monitor.stopMonitoringKey(obj, 'batman')
        res.statusCode.should.equal(200)
        response.batman.should.equal('rich but grumpy')
        return done()
      })
    })

    it('should report new value if original object is updated', (done) => {
      const obj = {batman: 'rich but grumpy'}
      monitor.monitorKey(obj, 'batman')
      obj.batman = 'Caped Crusader'

      request.get({
        url: 'http://127.0.0.1:9999/_monitor/status',
        json: true
      }, (err, res, response) => {
        if (err) return done(err)
        monitor.stopMonitoringKey(obj, 'batman')
        res.statusCode.should.equal(200)
        response.batman.should.equal('Caped Crusader')
        return done()
      })
    })
  })

  describe('stopMonitoringKey', () => {
    it('stops monitoring a given key on an object', (done) => {
      const obj = {batman: 'rich but grumpy'}
      monitor.monitorKey(obj, 'batman')
      monitor.stopMonitoringKey(obj, 'batman')

      request.get({
        url: 'http://127.0.0.1:9999/_monitor/status',
        json: true
      }, (err, res, response) => {
        if (err) return done(err)
        monitor.stopMonitoringKey(obj, 'batman')
        res.statusCode.should.equal(200)
        expect(response.batman).to.equal(undefined)
        return done()
      })
    })
  })
})
