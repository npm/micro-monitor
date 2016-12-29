const restify = require('restify')
const exec = require('child_process').exec

const monitoredObjects = []

module.exports = function startMonitor (port, callback) {
  const monitor = restify.createServer({name: 'monitor'})
  let commitHash = ''

  monitor.get('/_monitor/ping', function (request, response, next) {
    response.send(200, 'pong')
    next()
  })

  monitor.get('/_monitor/status', function (request, response, next) {
    const status = {
      pid: process.pid,
      uptime: process.uptime(),
      rss: process.memoryUsage(),
      cmdline: process.argv,
      git: commitHash
    }
    monitoredObjects.forEach((mo) => {
      status[mo.key] = mo.obj[mo.key]
    })
    response.json(200, status)
    next()
  })

  exec('git rev-parse --short HEAD', function (err, stdout, stderr) {
    if (!err && stdout) commitHash = stdout.trim()
    monitor.listen(port, callback)
  })

  return {
    monitorKey: (obj, key) => {
      monitoredObjects.push({
        key: key,
        obj: obj
      })
    },
    stopMonitoringKey: (obj, key) => {
      const element = monitoredObjects.find((e) => {
        return e.key === key && e.obj === obj
      })
      monitoredObjects.splice(monitoredObjects.indexOf(element), 1)
    }
  }
}
