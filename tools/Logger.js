const winston = require("winston")
const fs = require("fs")

winston.format.combine(
    winston.format.colorize(),
    winston.format.json()
  );


  const logger = winston.createLogger({
      format: winston.format.json(),
    transports: [
        new winston.transports.Console({format: winston.format.cli() }),
        new winston.transports.File({ filename: 'debug.log', level: 'debug' }),
        new winston.transports.File({ filename: 'error.log', level: 'error' }),
        new winston.transports.File({ filename: 'combined.log' }),
    ],
});

logger.deleteLogFiles = ()=>{
    fs.readdirSync("./").forEach(file => {
        if(file.match(/\.log$/)){
        fs.unlinkSync(`./${file}`)
        }
    })
}

module.exports = logger