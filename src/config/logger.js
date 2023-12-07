const winston = require("winston")
const { NODE_ENV } =  require("./constant")

const errorFormat = winston.format((info) => {
    if (info instanceof Error) {
        Object.assign(info, { message: info.stack })
    }
    return info
})
const logger = winston.createLogger({
    level: NODE_ENV === 'development' ? "debug" : 'info',
    format: winston.format.combine(
        errorFormat(),
        NODE_ENV=== 'development' ? winston.format.colorize() : winston.format.uncolorize(),
        winston.format.splat(),
        winston.format.printf((info) => `${info.level} : ${info.message}`)

    ),
    transports: [new winston.transports.Console({ stderrLevels: ['error'], })]

})

module.exports = logger