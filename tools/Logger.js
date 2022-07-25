const winston = require('winston')
const fs = require('fs')
const { startTimer, stopTimer } = require('./timer')

winston.format.combine(
  winston.format.colorize(),
  winston.format.json()
)

const logger = winston.createLogger({
  format: winston.format.prettyPrint(),
  transports: [
    new winston.transports.Console({ format: winston.format.cli() }),
    new winston.transports.File({ filename: 'sketchy.debug.log', level: 'debug' }),
    new winston.transports.File({ filename: 'sketchy.error.log', level: 'error' }),
    new winston.transports.File({ filename: 'sketchy.log' })
  ]
})

logger.deleteLogFiles = () => {
  fs.readdirSync('./').forEach(file => {
    if (file.match(/\.log$/)) {
      fs.unlinkSync(`./${file}`)
    }
  })
}

logger.time = (message, callback) => {
  logger.info('=> ' + message)
  startTimer()
  callback()
  logger.info(`${stopTimer()}for ${message}\n`.toLocaleLowerCase())
}

logger.completeLog = (message) => logger.info(`${message.padStart(25, ' ')}`)

exports.LOGGER = logger
