const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const { User } = require("../models/_models")
const { createResponse } = require("../utils/response")
const { add: addToBlacklist } = require("../utils/tokenBlacklist")
const { logger } = require("../utils/logger")
const { logActivity } = require("../utils/activityLogger")

async function register(req, res) {
    try {
        const { username, password } = req.body

        if (!username || !password) {
            return res
                .status(400)
                .json(
                    createResponse(false, "Username and password are required.")
                )
        }

        if (password.length < 8 || password.length > 50) {
            return res
                .status(400)
                .json(
                    createResponse(
                        false,
                        "Password must be between 8 and 50 characters long."
                    )
                )
        }

        const existingUser = await User.findOne({ where: { username } })
        if (existingUser) {
            return res
                .status(400)
                .json(createResponse(false, "Username is already taken."))
        }

        const hashedPassword = await bcrypt.hash(password, 10)
        const user = await User.create({
            username,
            password: hashedPassword,
        })

        await logActivity(user.id, "REGISTER", { ip: req.ip })

        res.status(201).json(
            createResponse(
                true,
                "User registered successfully. Pending admin approval.",
                { userId: user.id }
            )
        )
    } catch (err) {
        logger.error(`Error during registration: ${err.message}`)
        res.status(500).json(createResponse(false, "Failed to register user."))
    }
}

async function login(req, res) {
    try {
        const { username, password } = req.body

        if (!username || !password) {
            return res
                .status(400)
                .json(
                    createResponse(false, "Username and password are required.")
                )
        }

        const user = await User.findOne({ where: { username } })

        if (!user) {
            return res
                .status(401)
                .json(createResponse(false, "Invalid username or password."))
        }

        if (!user.isActive) {
            return res
                .status(403)
                .json(createResponse(false, "Account is not yet activated."))
        }

        const isPasswordValid = await bcrypt.compare(password, user.password)

        if (!isPasswordValid) {
            return res
                .status(401)
                .json(createResponse(false, "Invalid username or password."))
        }

        const token = jwt.sign(
            { id: user.id, isAdmin: user.isAdmin },
            process.env.JWT_SECRET,
            {
                expiresIn: "1d",
            }
        )

        await logActivity(user.id, "LOGIN", { ip: req.ip })

        res.json(createResponse(true, "Login successful.", { token }))
    } catch (err) {
        logger.error(`Error during login: ${err.message}`)
        res.status(500).json(createResponse(false, "Failed to login."))
    }
}

async function logout(req, res) {
    try {
        const token = req.headers.authorization?.split(" ")[1]

        if (!token) {
            return res
                .status(400)
                .json(createResponse(false, "Token is required to logout."))
        }

        let userId = null
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET)
            userId = decoded.id
        } catch (err) {
            logger.error(`Invalid token during logout: ${err.message}`)
            return res.status(401).json(createResponse(false, "Invalid token."))
        }

        await logActivity(userId, "LOGOUT", {
            ip: req.ip,
        })

        addToBlacklist(token)
        res.json(createResponse(true, "Logout successful."))
    } catch (err) {
        logger.error(`Error during logout: ${err.message}`)
        res.status(500).json(createResponse(false, "Failed to logout."))
    }
}

async function changePassword(req, res) {
    try {
        const { oldPassword, newPassword } = req.body

        if (!oldPassword || !newPassword) {
            return res
                .status(400)
                .json(
                    createResponse(
                        false,
                        "Old password and new password are required."
                    )
                )
        }

        if (newPassword.length < 8 || newPassword.length > 50) {
            return res
                .status(400)
                .json(
                    createResponse(
                        false,
                        "New password must be between 8 and 50 characters long."
                    )
                )
        }

        const user = await User.findByPk(req.user.id)

        if (!user) {
            return res
                .status(404)
                .json(createResponse(false, "User not found."))
        }

        const isPasswordValid = await bcrypt.compare(oldPassword, user.password)

        if (!isPasswordValid) {
            return res
                .status(401)
                .json(createResponse(false, "Old password is incorrect."))
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10)
        user.password = hashedPassword
        await user.save()

        await logActivity(user.id, "PASSWORD_CHANGED", { ip: req.ip })

        res.json(createResponse(true, "Password changed successfully."))
    } catch (err) {
        logger.error(`Error during password change: ${err.message}`)
        res.status(500).json(
            createResponse(false, "Failed to change password.")
        )
    }
}

module.exports = { register, login, logout, changePassword }
