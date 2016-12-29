const assert = require('assert')
const restify = require('restify')
const exec = require('child_process').exec

let contributor = null

module.exports = function startMonitor (port, callback) {
  const monitor = restify.createServer({name: 'monitor'})
  let commitHash = ''

  monitor.get('/_monitor/ping', function (request, response, next) {
    response.send(200, 'pong')
    next()
  })

  monitor.get('/_monitor/status', function (request, response, next) {
    const status = Object.assign({
      pid: process.pid,
      uptime: process.uptime(),
      rss: process.memoryUsage(),
      cmdline: process.argv,
      git: commitHash
    }, contributor ? contributor() : undefined)
    response.json(200, status)
    next()
  })

  exec('git rev-parse --short HEAD', function (err, stdout, stderr) {
    if (!err && stdout) commitHash = stdout.trim()
    monitor.listen(port, callback)
  })

  return {
    contribute: (_contributor) => {
      assert(typeof _contributor === 'function', 'contributor must be a function')
      contributor = _contributor
    }
  }
}
