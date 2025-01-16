const express = require("express")
const { isAuthenticated, optionalAuthenticated } = require("../middleware/auth")
const {
    uploadFile,
    downloadFile,
    editFile,
    getFileStats,
    getFileDetails,
    deleteFile,
    getUserFiles,
    verifyFilePassword,
} = require("../controllers/fileController")

const router = express.Router()

router.post("/upload", optionalAuthenticated, uploadFile)
router.get("/download/:id", optionalAuthenticated, downloadFile)
router.patch("/:id", isAuthenticated, editFile)
router.get("/stats", isAuthenticated, getFileStats)
router.get("/:id", optionalAuthenticated, getFileDetails)
router.delete("/:id", isAuthenticated, deleteFile)
router.get("/", isAuthenticated, getUserFiles)
router.post("/verify-password", verifyFilePassword)

module.exports = router
