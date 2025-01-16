const crypto = require("crypto")
const path = require("path")
const fs = require("fs")
const { File } = require("../models/File")
const { Setting } = require("../models/Setting")
const { FileAccessLog } = require("../models/_models")
const { createResponse } = require("../utils/response")
const { logger } = require("../utils/logger")
const { logActivity } = require("../utils/activityLogger")

function generateHash() {
    return crypto.randomBytes(16).toString("hex")
}

async function uploadFile(req, res) {
    try {
        const userId = req.user?.id || null
        const file = req.files?.file

        if (!file) {
            return res
                .status(400)
                .json(createResponse(false, "No file provided."))
        }

        const settings = await Setting.findAll()
        const config = settings.reduce((acc, setting) => {
            acc[setting.key] = setting.value
            return acc
        }, {})

        const maxFileSize = userId
            ? parseInt(config.maxFileSize, 10) || 10485760
            : parseInt(config.maxAnonymousFileSize, 10) || 5242880

        if (file.size > maxFileSize) {
            return res
                .status(400)
                .json(
                    createResponse(
                        false,
                        `File exceeds the maximum size of ${
                            maxFileSize / 1024 / 1024
                        } MB.`
                    )
                )
        }

        const expirationHours = userId
            ? parseInt(config.defaultExpirationHours, 10) || null
            : parseInt(config.maxAnonymousFileExpirationHours, 10) || null

        let expiresAt = req.body.expiresAt
            ? new Date(req.body.expiresAt)
            : expirationHours
            ? new Date(Date.now() + expirationHours * 60 * 60 * 1000)
            : null
        if (!req.body.expiresAt && userId) {
            expiresAt = null
        }

        if (!userId && expiresAt) {
            const maxAnonExpireDate = new Date(
                Date.now() + expirationHours * 60 * 60 * 1000
            )
            if (expiresAt > maxAnonExpireDate) {
                expiresAt = maxAnonExpireDate
            }
        }

        if (!userId) {
            if ("password" in req.body) {
                delete req.body.password
            }

            req.body.isPrivate = false
            req.body.accessLimit = null
        }

        const uniqueName = generateHash()
        const uploadDir = path.resolve(__dirname, "../../uploads")
        const filePath = path.join(uploadDir, uniqueName)

        file.mv(filePath, async (err) => {
            if (err) {
                logger.error(err)
                return res
                    .status(500)
                    .json(createResponse(false, "Failed to save file."))
            }

            const newFile = await File.create({
                userId,
                filename: uniqueName,
                originalName: file.name,
                isPrivate: userId ? req.body.isPrivate || false : false,
                password: userId ? req.body.password || null : null,
                expiresAt,
                accessLimit: req.body.accessLimit || null,
                downloads: 0,
                size: file.size,
            })

            await logActivity(req.user?.id, "UPLOAD_FILE", {
                fileId: newFile.id,
                fileName: newFile.originalName,
                size: newFile.size,
            })

            res.status(201).json(
                createResponse(true, "File uploaded successfully.", {
                    fileId: newFile.id,
                    userId: newFile.userId,
                    expiresAt: newFile.expiresAt,
                    size: newFile.size,
                })
            )
        })
    } catch (err) {
        logger.error(`Error uploading file: ${err.message}`)
        res.status(500).json(createResponse(false, "Failed to upload file."))
    }
}

async function downloadFile(req, res) {
    try {
        const fileId = req.params.id
        const file = await File.findByPk(fileId)

        if (!file) {
            return res
                .status(404)
                .json(createResponse(false, "File not found."))
        }

        if (file.isPrivate && !req.user) {
            return res
                .status(403)
                .json(
                    createResponse(
                        false,
                        "This file is private. Authorization required."
                    )
                )
        }

        const providedPassword = req.headers["x-file-password"]

        if (
            file.password &&
            (!providedPassword || file.password !== providedPassword)
        ) {
            if (!req.user || file.userId !== req.user.id) {
                return res
                    .status(401)
                    .json(createResponse(false, "Invalid file password."))
            }
        }

        if (file.expiresAt && new Date(file.expiresAt) < new Date()) {
            await logActivity(req.user?.id, "DOWNLOAD_ATTEMPT_FAILED", {
                fileId: file.id,
                reason: "File expired",
            })

            return res.status(410).json({
                success: false,
                message: "This file has expired and is no longer available.",
            })
        }

        if (file.accessLimit && file.downloads >= file.accessLimit) {
            await logActivity(req.user?.id, "DOWNLOAD_ATTEMPT_FAILED", {
                fileId: file.id,
                reason: "Access limit exceeded",
            })

            return res.status(403).json({
                success: false,
                message: "Access limit for this file has been reached.",
            })
        }

        const filePath = path.resolve(__dirname, "../../uploads", file.filename)

        if (!fs.existsSync(filePath)) {
            return res
                .status(404)
                .json(createResponse(false, "File not found on the server."))
        }

        await FileAccessLog.create({
            ipAddress: req.ip,
            userId: req.user?.id || null,
            fileId,
            accessType: "download",
        })

        file.downloads += 1
        await file.save()

        await logActivity(req.user?.id, "DOWNLOAD_FILE", {
            ip: req.ip,
            fileId: file.id,
            fileName: file.originalName,
        })

        res.download(filePath, file.originalName)
    } catch (err) {
        logger.error(`Error downloading file: ${err.message}`)
        res.status(500).json(createResponse(false, "Failed to retrieve file."))
    }
}

function _getFileDetails(file) {
    return {
        id: file.id,
        originalName: file.originalName,
        isPrivate: file.isPrivate,
        passwordProtected: !!file.password,
        expiresAt: file.expiresAt,
        accessLimit: file.accessLimit,
        downloads: file.downloads,
        size: file.size,
        createdAt: file.createdAt,
    }
}

async function getFileDetails(req, res) {
    try {
        const fileId = req.params.id
        const file = await File.findByPk(fileId)

        if (!file) {
            return res
                .status(404)
                .json(createResponse(false, "File not found."))
        }

        if (file.isPrivate) {
            if (!req.user) {
                return res
                    .status(403)
                    .json(
                        createResponse(
                            false,
                            "This file is private. Authorization required."
                        )
                    )
            }

            if (file.userId !== req.user.id && !req.user.isAdmin) {
                return res
                    .status(403)
                    .json(
                        createResponse(
                            false,
                            "You are not authorized to view this file."
                        )
                    )
            }
        }

        if (file.password) {
            if (!req.body.password || file.password !== req.body.password) {
                if (!req.user || file.userId !== req.user.id) {
                    return res
                        .status(401)
                        .json(createResponse(false, "Invalid file password."))
                }
            }
        }

        const fileDetails = _getFileDetails(file)

        res.json(createResponse(true, "File details retrieved.", fileDetails))
    } catch (err) {
        logger.error(`Error retrieving file details: ${err.message}`)
        res.status(500).json(
            createResponse(false, "Failed to retrieve file details.")
        )
    }
}

async function deleteFile(req, res) {
    try {
        const fileId = req.params.id
        const userId = req.user?.id || null
        const file = await File.findOne({ where: { id: fileId } })

        if (!file) {
            return res
                .status(404)
                .json(createResponse(false, "File not found."))
        }

        if (file.userId !== userId && !req.user?.isAdmin) {
            return res
                .status(403)
                .json(
                    createResponse(false, "Unauthorized to delete this file.")
                )
        }

        const filePath = path.resolve(__dirname, "../../uploads", file.filename)

        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath)
        }

        try {
            await file.destroy()
            await logActivity(req.user?.id, "DELETE_FILE", {
                fileId: file.id,
                originalName: file.originalName,
            })

            res.json(createResponse(true, "File deleted successfully."))
        } catch (err) {
            if (err.name === "SequelizeForeignKeyConstraintError") {
                await file.update({
                    userId: null,
                    isPrivate: true,
                    expiresAt: null,
                })

                await logActivity(req.user?.id, "DELETE_FILE_SOFT", {
                    fileId: file.id,
                    originalName: file.originalName,
                    reason: "Soft delete due to foreign key constraint.",
                })

                res.json(
                    createResponse(
                        true,
                        "File marked as deleted due to constraints."
                    )
                )
            } else {
                throw err
            }
        }
    } catch (err) {
        logger.error(`Error deleting file: ${err.message}`)
        res.status(500).json(createResponse(false, "Failed to delete file."))
    }
}

async function getUserFiles(req, res) {
    try {
        const userId = req.user.id
        const files = await File.findAll({ where: { userId } })

        res.json(
            createResponse(true, "User files retrieved successfully.", files)
        )
    } catch (err) {
        logger.error(`Error retrieving user files: ${err.message}`)
        res.status(500).json(
            createResponse(false, "Failed to retrieve user files.")
        )
    }
}

async function getFileStats(req, res) {
    try {
        const userId = req.user.id
        const files = await File.findAll({ where: { userId } })

        const totalFiles = files.length
        const totalSpaceUsed = files.reduce(
            (sum, file) => sum + (file.size || 0),
            0
        )

        res.json(
            createResponse(true, "File statistics retrieved.", {
                totalFiles,
                totalSpaceUsed,
            })
        )
    } catch (err) {
        logger.error(`Error retrieving file statistics: ${err.message}`)
        res.status(500).json(
            createResponse(false, "Failed to retrieve file statistics.")
        )
    }
}

async function editFile(req, res) {
    try {
        const fileId = req.params.id
        const userId = req.user.id
        const updates = req.body

        const file = await File.findByPk(fileId)

        if (!file) {
            return res
                .status(404)
                .json(createResponse(false, "File not found."))
        }

        if (file.userId !== userId && !req.user.isAdmin) {
            return res
                .status(403)
                .json(createResponse(false, "Unauthorized to edit this file."))
        }

        const previousData = {
            password: !!file.password,
            isPrivate: file.isPrivate,
            expiresAt: file.expiresAt,
            accessLimit: file.accessLimit,
        }

        file.password = updates.password ?? file.password
        file.expiresAt = updates.expiresAt ?? file.expiresAt
        file.accessLimit = updates.accessLimit ?? file.accessLimit
        file.isPrivate = updates.isPrivate ?? file.isPrivate

        await file.save()

        const updatedData = {
            password: !!file.password,
            isPrivate: file.isPrivate,
            expiresAt: file.expiresAt,
            accessLimit: file.accessLimit,
        }

        await logActivity(req.user?.id, "EDIT_FILE", {
            fileId: file.id,
            previousData,
            updatedData,
        })

        res.json(
            createResponse(true, "File metadata updated successfully.", {
                id: file.id,
                isPrivate: file.isPrivate,
                expiresAt: file.expiresAt,
                accessLimit: file.accessLimit,
                password: !!file.password,
            })
        )
    } catch (err) {
        logger.error(`Error updating file metadata: ${err.message}`)
        res.status(500).json(
            createResponse(false, "Failed to update file metadata.")
        )
    }
}

async function verifyFilePassword(req, res) {
    try {
        const { fileId, password } = req.body

        if (!fileId || !password) {
            return res
                .status(400)
                .json(
                    createResponse(false, "File ID and password are required.")
                )
        }

        const file = await File.findByPk(fileId)

        if (!file) {
            return res
                .status(404)
                .json(createResponse(false, "File not found."))
        }

        if (!file.password) {
            return res
                .status(400)
                .json(
                    createResponse(
                        false,
                        "This file does not require a password."
                    )
                )
        }

        if (file.password !== password) {
            return res
                .status(401)
                .json(createResponse(false, "Invalid password."))
        }

        const fileDetails = _getFileDetails(file)

        res.json(createResponse(true, "Password is correct.", fileDetails))
    } catch (err) {
        logger.error(`Error verifying file password: ${err.message}`)
        res.status(500).json(
            createResponse(false, "Failed to verify password.")
        )
    }
}

module.exports = {
    uploadFile,
    downloadFile,
    getFileDetails,
    deleteFile,
    editFile,
    getFileStats,
    getUserFiles,
    verifyFilePassword,
}
