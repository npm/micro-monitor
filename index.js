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

  monitor.on('request', (req, res) => {
    if (req.url !== '/_monitor/ping') {
      return
    }
    req.handled = true
    res.end('pong')
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

  exec('git rev-parse --short HEAD', function (err, stdout, stderr) {
    if (!err && stdout) commitHash = stdout.trim()
    monitor.listen(port, callback)
  })

  return Object.assign(monitor, {
    contribute: (_contributor) => {
      assert(typeof _contributor === 'function', 'contributor must be a function')
      contributor = _contributor
    }
  })
}
