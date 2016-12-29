# Micro Monitor

[![Build Status](https://img.shields.io/travis/npm/micro-monitor/master.svg)](https://travis-ci.org/npm/micro-monitor)
[![Coverage Status](https://coveralls.io/repos/npm/micro-monitor/badge.svg?branch=master)](https://coveralls.io/r/npm/micro-monitor?branch=master)

Add a standardized monitoring endpoint to your application. Especially
useful for adding monitoring to services that do not expose an
HTTP interface.

## Basic Usage

Simply initialize the monitor when your application starts up:

```js
const Monitor = require('micro-monitor')

let monitor = Monitor(9999, () => {
// do something now that monitoring is running
})
```

* `http://0.0.0.1:9999/_monitor/status` is now available, and will
  respond with a `200` status and status object:

```json
{
  "pid": 42176,
  "uptime": 0.796,
  "rss": {
    "rss": 53907456,
    "heapTotal": 37728256,
    "heapUsed": 26032248
  },
  "cmdline": [
    "/Users/benjamincoe/.nvm/versions/node/v7.1.0/bin/node",
    "/Users/benjamincoe/npm-inc/micro-monitor/node_modules/mocha/bin/_mocha",
    "test.js"
  ],
  "git": "b0c57aa"
}
```

* `http://0.0.0.1:9999/_monitor/ping` is also available and will respond with
  status `200` and the text `OK`.

## Customizing Status Information

You can customize the status information returned using `contribute`:

* **monitor.contribute(contributor)**: contribute additional information
  to the status object returned on `/_monitor/status`.
  * `contributor`: a function returning the object to supplement the status
    object with.

## License

ISC
