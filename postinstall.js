const childProcess = require('child_process')
const isGlobal = require('is-installed-globally')

if (isGlobal) {
  childProcess.exec('npm run build')
}
