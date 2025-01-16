const { ActivityLog } = require("../models/_models")

async function logActivity(userId, action, details) {
    try {
        await ActivityLog.create({
            userId: userId || null,
            action,
            details: JSON.stringify(details || {}),
        })
    } catch (err) {
        console.error("Error logging activity:", err.message)
    }
}

module.exports = { logActivity }
