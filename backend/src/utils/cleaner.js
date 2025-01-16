const fs = require("fs")
const path = require("path")
const { File } = require("../models/_models")
const { logger } = require("./logger")

const UPLOADS_DIR = path.join(__dirname, "../../uploads")
const TO_BE_DELETED_PREFIX = "tobedeleted_"

async function cleanExpiredFiles() {
    try {
        const files = fs.readdirSync(UPLOADS_DIR)

        const filesInDB = await File.findAll({
            attributes: ["id", "originalName", "expiresAt", "filename"],
        })

        const fileNamesInDB = filesInDB.map((file) => file.filename)

        for (const file of filesInDB) {
            if (file.expiresAt && new Date(file.expiresAt) < new Date()) {
                const filePath = path.join(UPLOADS_DIR, file.originalName)

                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath)
                    logger.info(`Deleted expired file: ${file.originalName}`)
                }

                await file.update({
                    userId: null,
                    isPrivate: true,
                    expiresAt: null,
                })
                logger.info(
                    `Marked file as deleted in database: ${file.originalName}`
                )
            }
        }

        files.forEach((file) => {
            const filePath = path.join(UPLOADS_DIR, file)

            if (!fileNamesInDB.includes(file)) {
                const isToBeDeleted = file.startsWith(TO_BE_DELETED_PREFIX)

                if (isToBeDeleted) {
                    const stats = fs.statSync(filePath)
                    const modificationTime = new Date(stats.mtime)
                    const currentTime = new Date()

                    const timeDifference = currentTime - modificationTime
                    const oneDayInMs = 24 * 60 * 60 * 1000

                    if (timeDifference > oneDayInMs) {
                        fs.unlinkSync(filePath)
                        logger.info(`Deleted orphaned file: ${file}`)
                    }
                } else {
                    const newFileName = `${TO_BE_DELETED_PREFIX}${file}`
                    const newFilePath = path.join(UPLOADS_DIR, newFileName)

                    fs.renameSync(filePath, newFilePath)
                    logger.info(
                        `Renamed orphaned file: ${file} -> ${newFileName}`
                    )
                }
            }
        })

        logger.info("File cleaning completed successfully.")
    } catch (err) {
        logger.error(`Error while cleaning files: ${err.message}`)
    }
}

module.exports = { cleanExpiredFiles }
