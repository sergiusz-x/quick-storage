const { Sequelize } = require("sequelize")
const path = require("path")
const { logger } = require("../utils/logger")
const fs = require("fs")

const databasePath =
    process.env.DATABASE_URL || path.resolve(__dirname, "../../database.db")

if (!fs.existsSync(databasePath)) {
    fs.writeFileSync(databasePath, "")
    logger.info(`Database file created at: ${databasePath}`)
}

const sequelize = new Sequelize({
    dialect: "sqlite",
    storage: databasePath,
    logging: (msg) => {
        if (msg.includes("ERROR")) {
            logger.error(msg)
        }
    },
})

async function initializeDatabase() {
    try {
        await sequelize.authenticate()
        logger.info("Database connected successfully.")

        await sequelize.sync({ alter: false })
        logger.info("Database synchronized.")

        const { Setting } = require("../models/Setting")
        const defaultSettings = [
            { key: "maxFileSize", value: "5242880" },
            { key: "defaultExpirationHours", value: "24" },
            { key: "maxAnonymousFileSize", value: "1048576" },
            { key: "maxAnonymousFileExpirationHours", value: "24" },
        ]

        const transaction = await sequelize.transaction()
        try {
            for (const setting of defaultSettings) {
                await Setting.findOrCreate({
                    where: { key: setting.key },
                    defaults: { value: setting.value },
                    transaction,
                })
            }
            await transaction.commit()
            logger.info("Default settings initialized.")
        } catch (err) {
            await transaction.rollback()
            throw err
        }

        seedDefaultUsers()
    } catch (error) {
        logger.error("Unable to initialize the database:", error)
        process.exit(1)
    }
}

async function seedDefaultUsers() {
    const { User } = require("../models/_models")
    const bcrypt = require("bcrypt")

    try {
        const adminExists = await User.findOne({ where: { username: "admin" } })
        const userExists = await User.findOne({ where: { username: "user" } })

        if (!adminExists) {
            const hashedPassword = await bcrypt.hash("admin", 10)
            await User.create({
                username: "admin",
                password: hashedPassword,
                isAdmin: true,
                isActive: true,
            })
            console.log("Admin user created.")
        }

        if (!userExists) {
            const hashedPassword = await bcrypt.hash("user", 10)
            await User.create({
                username: "user",
                password: hashedPassword,
                isAdmin: false,
                isActive: true,
            })
            console.log("Standard user created.")
        }
    } catch (err) {
        console.error("Error seeding default users:", err.message)
    }
}

module.exports = {
    sequelize,
    initializeDatabase,
}
