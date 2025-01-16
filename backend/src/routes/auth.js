const express = require("express")
const {
    login,
    register,
    logout,
    changePassword,
} = require("../controllers/authController")
const { isAuthenticated } = require("../middleware/auth")
const { loginRateLimiter } = require("../middleware/rateLimiter")

const router = express.Router()

router.post("/register", register)
router.post("/login", loginRateLimiter, login)
router.post("/logout", isAuthenticated, logout)
router.patch("/change-password", isAuthenticated, changePassword)

module.exports = router
