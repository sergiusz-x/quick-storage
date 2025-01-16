const { User } = require("../models/_models")
const { File } = require("../models/File")
const { ActivityLog } = require("../models/_models")
const { FileAccessLog } = require("../models/_models")
const { Setting } = require("../models/Setting")
const { createResponse } = require("../utils/response")
const { Op } = require("sequelize")

async function getPendingAccounts(req, res) {
    try {
        const pendingAccounts = await User.findAll({
            where: { isActive: false },
        })
        res.json(
            createResponse(true, "Pending accounts retrieved.", {
                pendingAccounts,
            })
        )
    } catch (err) {
        res.status(500).json(
            createResponse(false, "Failed to fetch pending accounts.")
        )
    }
}

async function approveAccount(req, res) {
    try {
        const userId = req.params.id
        await User.update({ isActive: true }, { where: { id: userId } })
        res.json(createResponse(true, "Account approved successfully."))
    } catch (err) {
        res.status(500).json(
            createResponse(false, "Failed to approve account.")
        )
    }
}

async function rejectAccount(req, res) {
    try {
        const userId = req.params.id
        await User.destroy({ where: { id: userId, isActive: false } })
        res.json(createResponse(true, "Account rejected successfully."))
    } catch (err) {
        res.status(500).json(createResponse(false, "Failed to reject account."))
    }
}

async function getActivityLogs(req, res) {
    try {
        const { limit = 50, offset = 0, dateRange } = req.query
        const where = {}

        if (dateRange) {
            const [startDate, endDate] = dateRange.split(",")
            where.createdAt = {
                [Op.between]: [new Date(startDate), new Date(endDate)],
            }
        }

        const logs = await ActivityLog.findAndCountAll({
            where,
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [["createdAt", "DESC"]],
            include: [
                {
                    model: User,
                    as: "User",
                    attributes: ["username"],
                },
            ],
        })

        const logsWithUsername = logs.rows.map((log) => ({
            id: log.id,
            userId: log.userId,
            username: log.User ? log.User.username : null,
            action: log.action,
            details: log.details,
            createdAt: log.createdAt,
        }))

        res.json(
            createResponse(true, "Activity logs retrieved.", {
                logs: logsWithUsername,
                total: logs.count,
            })
        )
    } catch (err) {
        console.log(err)
        res.status(500).json(
            createResponse(false, "Failed to fetch activity logs.")
        )
    }
}

async function getFileAccessLogs(req, res) {
    try {
        const { limit = 10, offset = 0, dateRange } = req.query
        const where = {}

        if (dateRange) {
            const [startDate, endDate] = dateRange.split(",")
            where.createdAt = {
                [Op.between]: [new Date(startDate), new Date(endDate)],
            }
        }

        const logs = await FileAccessLog.findAndCountAll({
            where,
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [["createdAt", "DESC"]],
            include: [
                {
                    model: User,
                    as: "User",
                    attributes: ["id", "username"],
                },
                {
                    model: File,
                    as: "File",
                    attributes: ["id", "originalName", "size"],
                },
            ],
        })

        const formattedLogs = logs.rows.map((log) => ({
            id: log.id,
            userId: log.userId,
            username: log.User ? log.User.username : null,
            fileId: log.fileId,
            fileName: log.File ? log.File.originalName : null,
            fileSize: log.File ? log.File.size : null,
            accessType: log.accessType,
            accessDetails: log.accessDetails,
            createdAt: log.createdAt,
        }))

        res.json(
            createResponse(true, "File access logs retrieved.", {
                logs: formattedLogs,
                total: logs.count,
            })
        )
    } catch (err) {
        console.error("Error fetching file access logs:", err.message)
        res.status(500).json(
            createResponse(false, "Failed to fetch file access logs.")
        )
    }
}

async function getSystemSettings(req, res) {
    try {
        const settings = await Setting.findAll()
        const formattedSettings = settings.reduce((acc, setting) => {
            acc[setting.key] = setting.value
            return acc
        }, {})
        res.json(
            createResponse(true, "System settings retrieved.", {
                settings: formattedSettings,
            })
        )
    } catch (err) {
        res.status(500).json(
            createResponse(false, "Failed to fetch system settings.")
        )
    }
}

async function updateSystemSettings(req, res) {
    try {
        const updates = req.body
        for (const key in updates) {
            await Setting.update({ value: updates[key] }, { where: { key } })
        }
        res.json(createResponse(true, "System settings updated successfully."))
    } catch (err) {
        res.status(500).json(
            createResponse(false, "Failed to update system settings.")
        )
    }
}

async function getUsers(req, res) {
    try {
        const { status, page = 1, limit = 10 } = req.query
        const offset = (page - 1) * limit

        const where = {}
        if (status) {
            if (status === "active") where.isActive = true
            else if (status === "inactive") where.isActive = false
            else if (status === "pending") where.isActive = null
        }

        const users = await User.findAndCountAll({
            where,
            limit: parseInt(limit, 10),
            offset: parseInt(offset, 10),
        })

        res.json(
            createResponse(true, "Users retrieved successfully.", {
                users: users.rows,
                total: users.count,
                page: parseInt(page, 10),
                totalPages: Math.ceil(users.count / limit),
            })
        )
    } catch (err) {
        logger.error(`Error retrieving users: ${err.message}`)
        res.status(500).json(createResponse(false, "Failed to retrieve users."))
    }
}

async function getSystemStats(req, res) {
    try {
        const totalUsers = await User.count()
        const totalFiles = await File.count()
        const totalSpaceUsed = await File.sum("size")

        res.json(
            createResponse(true, "System statistics retrieved.", {
                totalUsers,
                totalFiles,
                totalSpaceUsed: totalSpaceUsed || 0,
            })
        )
    } catch (err) {
        res.status(500).json(
            createResponse(false, "Failed to fetch system statistics.")
        )
    }
}

async function activateUser(req, res) {
    try {
        const userId = req.params.id
        const user = await User.findByPk(userId)

        if (!user) {
            return res
                .status(404)
                .json(createResponse(false, "User not found."))
        }

        user.isActive = true
        await user.save()

        res.json(createResponse(true, "User activated successfully."))
    } catch (err) {
        logger.error(`Error activating user: ${err.message}`)
        res.status(500).json(createResponse(false, "Failed to activate user."))
    }
}

async function deactivateUser(req, res) {
    try {
        const userId = req.params.id
        const user = await User.findByPk(userId)

        if (!user) {
            return res
                .status(404)
                .json(createResponse(false, "User not found."))
        }

        user.isActive = false
        await user.save()

        res.json(createResponse(true, "User deactivated successfully."))
    } catch (err) {
        logger.error(`Error deactivating user: ${err.message}`)
        res.status(500).json(
            createResponse(false, "Failed to deactivate user.")
        )
    }
}

module.exports = {
    getPendingAccounts,
    approveAccount,
    rejectAccount,
    getActivityLogs,
    getFileAccessLogs,
    getSystemSettings,
    updateSystemSettings,
    getUsers,
    getSystemStats,
    activateUser,
    deactivateUser,
}
