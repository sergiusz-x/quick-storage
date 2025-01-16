const { DataTypes } = require("sequelize")
const { sequelize } = require("../config/database")
const { User } = require("./User")
const crypto = require("crypto")

const File = sequelize.define("File", {
    id: {
        type: DataTypes.STRING(16),
        primaryKey: true,
        allowNull: false,
        defaultValue: () => crypto.randomBytes(8).toString("hex"),
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: User,
            key: "id",
        },
    },
    filename: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    originalName: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    isPrivate: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    password: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    expiresAt: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    accessLimit: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    downloads: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
    size: {
        type: DataTypes.BIGINT,
        allowNull: true,
    },
    createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
})

module.exports = { File }
