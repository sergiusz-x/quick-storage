const rateLimit = require("express-rate-limit")

const generalRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: {
        success: false,
        message:
            "Too many requests from this IP, please try again after 15 minutes.",
    },
    standardHeaders: true,
    legacyHeaders: false,
})

const loginRateLimiter = rateLimit({
    windowMs: 5 * 60 * 1000,
    max: 5,
    message: {
        success: false,
        message: "Too many login attempts, please try again after 5 minutes.",
    },
    standardHeaders: true,
    legacyHeaders: false,
})

module.exports = { generalRateLimiter, loginRateLimiter }
