const jwt = require("jsonwebtoken")
const { User } = require("../models/_models")
const { has: isTokenBlacklisted } = require("../utils/tokenBlacklist")
const { logger } = require("../utils/logger")

function isAuthenticated(req, res, next) {
    const token = req.headers.authorization?.split(" ")[1]

    if (!token) {
        return res.status(401).json({
            success: false,
            message: "Authorization token missing or invalid.",
        })
    }

    if (isTokenBlacklisted(token)) {
        return res.status(401).json({
            success: false,
            message: "Token is invalid (logged out or expired).",
        })
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        req.user = decoded
        next()
    } catch (err) {
        logger.error(
            `Authentication error: ${err.message}:\n${err.stack || "-"}`
        )
        res.status(401).json({
            success: false,
            message: "Authorization failed.",
        })
    }
}

const optionalAuthenticated = (req, res, next) => {
    const authHeader = req.headers.authorization

    if (authHeader) {
        const token = authHeader.split(" ")[1]

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET)
            req.user = decoded
        } catch (err) {
            req.user = null
        }
    } else {
        req.user = null
    }

    next()
}

async function isAdmin(req, res, next) {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized. User not authenticated.",
            })
        }

        const user = await User.findByPk(req.user.id)

        if (!user || !user.isAdmin) {
            return res.status(403).json({
                success: false,
                message: "Access denied. Admins only.",
            })
        }

        next()
    } catch (err) {
        logger.error(
            `Admin privilege verification error: ${err.message}:\n${
                err.stack || "-"
            }`
        )
        res.status(500).json({
            success: false,
            message: "Error verifying admin privilege.",
        })
    }
}

module.exports = { isAuthenticated, isAdmin, optionalAuthenticated }
