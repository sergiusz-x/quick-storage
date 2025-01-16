const { DataTypes } = require("sequelize")
const { sequelize } = require("../config/database")

const Setting = sequelize.define("Setting", {
    key: {
        type: DataTypes.STRING,
        primaryKey: true,
    },
    value: {
        type: DataTypes.STRING,
        allowNull: false,
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

module.exports = { Setting }
