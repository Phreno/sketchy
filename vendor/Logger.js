const winston = require("winston")
const fs = require("fs")

winston.format.combine(
    winston.format.colorize(),
    winston.format.json()
  );


winston.deleteLogFiles = ()=>{
    fs.readdirSync("./").forEach(file => {
        if(file.match(/\.log$/)){
        fs.unlinkSync(`./logs/${file}`)
        }
    })
}

module.exports = winston.createLogger({
    format: winston.format.json(),
    transports: [
        new winston.transports.Console({format: winston.format.simple(), }),
        new winston.transports.File({ filename: 'debug.log', level: 'debug' }),
        new winston.transports.File({ filename: 'error.log', level: 'error' }),
        new winston.transports.File({ filename: 'combined.log' }),
    ],
});