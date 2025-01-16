const express = require("express")
const { isAuthenticated, isAdmin } = require("../middleware/auth")
const {
    getPendingAccounts,
    approveAccount,
    rejectAccount,
    getActivityLogs,
    getFileAccessLogs,
    getSystemSettings,
    updateSystemSettings,
    getUsers,
    getSystemStats,
    activateUser,
    deactivateUser,
} = require("../controllers/adminController")

const router = express.Router()

router.get("/pending-accounts", isAuthenticated, isAdmin, getPendingAccounts)
router.patch("/approve-account/:id", isAuthenticated, isAdmin, approveAccount)
router.patch("/reject-account/:id", isAuthenticated, isAdmin, rejectAccount)
router.get("/logs", isAuthenticated, isAdmin, getActivityLogs)
router.get("/file-access-logs", isAuthenticated, isAdmin, getFileAccessLogs)
router.get("/settings", isAuthenticated, isAdmin, getSystemSettings)
router.patch("/settings", isAuthenticated, isAdmin, updateSystemSettings)
router.get("/users", isAuthenticated, isAdmin, getUsers)
router.get("/stats", isAuthenticated, isAdmin, getSystemStats)
router.patch("/users/:id/activate", isAuthenticated, activateUser)
router.patch("/users/:id/deactivate", isAuthenticated, deactivateUser)

module.exports = router
