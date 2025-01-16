const express = require("express")
const morgan = require("morgan")
const cors = require("cors")
const helmet = require("helmet")
const { logger } = require("./utils/logger")
const fileUpload = require("express-fileupload")
const { generalRateLimiter } = require("./middleware/rateLimiter")
const adminRoutes = require("./routes/admin")
const authRoutes = require("./routes/auth")
const fileRoutes = require("./routes/files")
const { initializeDatabase } = require("./config/database")
const { cleanExpiredFiles } = require("./utils/cleaner")

const app = express()

app.use(cors())
app.use(helmet())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(fileUpload())
app.use(generalRateLimiter)

const httpLogStream = require("fs").createWriteStream("./logs/http.log", {
    flags: "a",
})
app.use(morgan("combined", { stream: httpLogStream }))

app.use("/api/admin", adminRoutes)
app.use("/api/auth", authRoutes)
app.use("/api/files", fileRoutes)

app.use((err, req, res, next) => {
    logger.error(err.stack)
    res.status(500).json({ success: false, message: "Something went wrong!" })
})

initializeDatabase()

cleanExpiredFiles()
setInterval(() => {
    cleanExpiredFiles()
}, 60 * 60 * 1000)

module.exports = app
