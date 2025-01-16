const app = require("./app")
const { logger } = require("./utils/logger")
const path = require("path")
require("dotenv").config({ path: path.resolve(__dirname, "../.env") })

const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
    logger.info(`Server running on http://localhost:${PORT}`)
})