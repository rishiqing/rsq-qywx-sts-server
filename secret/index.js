var os = require('os')
var fs = require('fs')
var config = JSON.parse(fs.readFileSync(os.homedir() + '/qywx/sts-server.json'))

module.exports = {
  aliOSS: config
}
