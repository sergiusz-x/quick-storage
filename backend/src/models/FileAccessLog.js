const { DataTypes } = require("sequelize")
const { sequelize } = require("../config/database")
const { File } = require("./File")

const FileAccessLog = sequelize.define("FileAccessLog", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    fileId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: File,
            key: "id",
        },
    },
    ipAddress: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    accessType: {
        type: DataTypes.ENUM("download", "view"),
        allowNull: false,
    },
    accessedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
    createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
    updatedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
})

module.exports = { FileAccessLog }
