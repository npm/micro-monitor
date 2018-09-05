'use strict'

const http = require('http')
const assert = require('assert')
const Promise = require('bluebird')
const exec = require('child_process').exec
const logger = require('bole')('monitor')

let contributor = null

module.exports = function startMonitor (port, callback) {
  const monitor = http.createServer()
  let commitHash = ''
  let listening = () => {}
  let ready = new Promise(resolve => {
    listening = resolve
  })

  monitor.on('request', (req, res) => {
    if (req.url !== '/_monitor/ping') {
      return
    }
    req.handled = true
    res.end(process.env.PING_RESPONSE || 'pong')
  })

  monitor.on('request', (req, res) => {
    if (req.url !== '/_monitor/status') {
      return
    }
    req.handled = true
    const getExtra = (
      contributor
      ? Promise.try(() => contributor())
      : Promise.resolve({})
    )

    const getStatus = getExtra.then(obj => {
      return Object.assign({
        pid: process.pid,
        uptime: process.uptime(),
        rss: process.memoryUsage(),
        cmdline: process.argv,
        git: commitHash
      }, obj)
    })

    return getStatus.then(status => {
      res.writeHead(200, {'content-type': 'application/json'})
      res.end(JSON.stringify(status))
    })
  })

  monitor.on('request', (req, res) => {
    logger.info(req)
    if (req.handled) {
      return
    }
    res.writeHead(404)
    res.end('')
  })

  function gitHash () {
    return new Promise(resolve => {
      exec('git rev-parse --short HEAD', function (err, stdout, stderr) {
        resolve((!err && stdout) ? stdout.trim() : undefined)
      })
    })
  }

  Promise.resolve(process.env.BUILD_HASH)
  .then(envHash => envHash || gitHash())
  .then(hash => {
    commitHash = hash
    monitor.listen(port, () => {
      listening()
      callback()
    })
  })

  return Object.assign(monitor, {
    contribute: (_contributor) => {
      assert(typeof _contributor === 'function', 'contributor must be a function')
      contributor = _contributor
    },
    stop: () => ready.then(() => new Promise(resolve => monitor.close(resolve)))
  })
}
