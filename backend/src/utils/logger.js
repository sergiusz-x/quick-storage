const fs = require("fs")
const path = require("path")
const winston = require("winston")
const DailyRotateFile = require("winston-daily-rotate-file")

const logDir = path.resolve(__dirname, "../../logs")
if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir)
}

const logger = winston.createLogger({
    level: "info",
    format: winston.format.combine(
        winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
        winston.format.printf(({ timestamp, level, message }) => {
            return `[${timestamp}] ${level.toUpperCase()}: ${message}`
        })
    ),
    transports: [
        new winston.transports.Console(),
        new DailyRotateFile({
            filename: path.join(logDir, "api-%DATE%.log"),
            datePattern: "YYYY-MM-DD",
            zippedArchive: true,
            maxSize: "20m",
            maxFiles: "1d",
        }),
    ],
})

module.exports = { logger }
