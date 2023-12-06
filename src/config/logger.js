const winston = require("winston")
import config from "../../../constants/variable.constant.js";

const errorFormat = winston.format((info) => {
    if (info instanceof Error) {
        Object.assign(info, { message: info.stack })
    }
    return info
})
const logger = winston.createLogger({
    level: config.env === 'development' ? "debug" : 'info',
    format: winston.format.combine(
        errorFormat(),
        config.env === 'development' ? winston.format.colorize() : winston.format.uncolorize(),
        winston.format.splat(),
        winston.format.printf((info) => `${info.level} : ${info.message}`)

    ),
    transports: [new winston.transports.Console({ stderrLevels: ['error'], })]

})

export default logger