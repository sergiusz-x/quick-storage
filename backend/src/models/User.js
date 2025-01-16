const { DataTypes } = require("sequelize")
const { sequelize } = require("../config/database")

const User = sequelize.define("User", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: {
            args: true,
            msg: "Username must be unique.",
        },
        validate: {
            len: [3, 30],
            is: /^[a-zA-Z0-9]+$/i, // Alphanumeric characters only
        },
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    isAdmin: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
})

module.exports = { User }
