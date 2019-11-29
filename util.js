const c = {
  cyan: '\x1b[36m',
  red: '\x1b[31m',
  end: '\x1b[39m'
}
const log = message => process.stdout.write(message + '\n')

module.exports = { log, c }