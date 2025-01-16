import React, { useState } from "react"
import AdminUsers from "../components/admin/AdminUsers"
import UsersManagement from "../components/admin/UsersManagement"
import ActivityLogs from "../components/admin/ActivityLogs"
import FileAccessLogs from "../components/admin/FileAccessLogs"
import SystemSettings from "../components/admin/SystemSettings"

function AdminPanel() {
    const [activeTab, setActiveTab] = useState("users")

    return (
        <div className="min-h-screen bg-gray-900 text-white p-8">
            <h1 className="text-4xl font-bold mb-6">Admin Panel</h1>

            <div className="flex space-x-4 mb-6">
                <button
                    className={`px-4 py-2 rounded ${
                        activeTab === "users" ? "bg-blue-600" : "bg-gray-800"
                    }`}
                    onClick={() => setActiveTab("users")}
                >
                    Manage Users
                </button>
                <button
                    className={`px-4 py-2 rounded ${
                        activeTab === "approvenewaccounts"
                            ? "bg-blue-600"
                            : "bg-gray-800"
                    }`}
                    onClick={() => setActiveTab("approvenewaccounts")}
                >
                    Approve New Accounts
                </button>
                <button
                    className={`px-4 py-2 rounded ${
                        activeTab === "activityLogs"
                            ? "bg-blue-600"
                            : "bg-gray-800"
                    }`}
                    onClick={() => setActiveTab("activityLogs")}
                >
                    Activity Logs
                </button>
                <button
                    className={`px-4 py-2 rounded ${
                        activeTab === "fileLogs" ? "bg-blue-600" : "bg-gray-800"
                    }`}
                    onClick={() => setActiveTab("fileLogs")}
                >
                    File Access Logs
                </button>
                <button
                    className={`px-4 py-2 rounded ${
                        activeTab === "settings" ? "bg-blue-600" : "bg-gray-800"
                    }`}
                    onClick={() => setActiveTab("settings")}
                >
                    Settings
                </button>
            </div>

            <div className="bg-gray-800 p-6 rounded shadow-lg">
                {activeTab === "users" && <AdminUsers />}
                {activeTab === "approvenewaccounts" && <UsersManagement />}
                {activeTab === "activityLogs" && <ActivityLogs />}
                {activeTab === "fileLogs" && <FileAccessLogs />}
                {activeTab === "settings" && <SystemSettings />}
            </div>
        </div>
    )
}

export default AdminPanel
