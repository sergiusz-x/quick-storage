const { FileAccessLog } = require("../models/_models")

const logFileAccess = async (userId, fileId, ipAddress, accessType) => {
    try {
        await FileAccessLog.create({
            userId: userId || null,
            fileId,
            ipAddress,
            accessType,
        })
    } catch (error) {
        console.error(`[ERROR] Failed to log file access: ${error.message}`)
    }
}

module.exports = { logFileAccess }
