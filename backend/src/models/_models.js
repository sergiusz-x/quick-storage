const { sequelize } = require("../config/database")
const { User } = require("./User")
const { ActivityLog } = require("./ActivityLog")
const { FileAccessLog } = require("./FileAccessLog")
const { File } = require("./File")

User.hasMany(ActivityLog, { foreignKey: "userId" })
ActivityLog.belongsTo(User, { foreignKey: "userId", as: "User" })

User.hasMany(FileAccessLog, { foreignKey: "userId" })
FileAccessLog.belongsTo(User, { foreignKey: "userId", as: "User" })

File.hasMany(FileAccessLog, { foreignKey: "fileId" })
FileAccessLog.belongsTo(File, { foreignKey: "fileId", as: "File" })

module.exports = {
    sequelize,
    User,
    ActivityLog,
    FileAccessLog,
    File,
}
