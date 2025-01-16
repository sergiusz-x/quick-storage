import React, { useState } from "react"
import { useQuery, useMutation } from "@tanstack/react-query"
import {
    getUserFileStats,
    getUserFiles,
    deleteFile,
    editFile,
} from "../services/fileService"
import { useNavigate } from "react-router-dom"

function Dashboard() {
    const [files, setFiles] = useState([])
    const [error, setError] = useState(null)
    const [stats, setStats] = useState(null)
    const [editingFile, setEditingFile] = useState(null)
    const [editOptions, setEditOptions] = useState({
        password: "",
        expiresAt: "",
        accessLimit: "unlimited",
        isPrivate: false,
    })

    const navigate = useNavigate()

    const { isLoading: isFilesLoading } = useQuery({
        queryKey: ["files"],
        queryFn: async () => {
            try {
                const token = localStorage.getItem("token")
                if (!token) throw new Error("Unauthorized")
                const response = await getUserFiles(token)
                if (!response || !response.data)
                    throw new Error("No files found.")
                setFiles(response.data)
                setError(null)
            } catch (err) {
                console.error("Error fetching files:", err)
                setFiles([])
                setError(err.message || "Failed to fetch files.")
            }
        },
        refetchOnWindowFocus: false,
    })

    const { isLoading: isStatsLoading } = useQuery({
        queryKey: ["userStats"],
        queryFn: async () => {
            try {
                const token = localStorage.getItem("token")
                if (!token) throw new Error("Unauthorized")
                const response = await getUserFileStats(token)
                if (!response.success) throw new Error("Failed to fetch stats.")
                setStats(response.data)
                setError(null)
            } catch (err) {
                console.error("Error fetching stats:", err)
                setError(err.message || "Failed to fetch user stats.")
            }
        },
        refetchOnWindowFocus: false,
    })

    const deleteMutation = useMutation({
        mutationFn: (fileId) => {
            const token = localStorage.getItem("token")
            return deleteFile(fileId, token)
        },
        onSuccess: (_, fileId) => {
            setFiles((prev) => prev.filter((file) => file.id !== fileId))
        },
        onError: (err) => {
            alert(err.response?.data?.message || "Failed to delete file.")
        },
    })

    const editMutation = useMutation({
        mutationFn: ({ fileId, updates }) => {
            const token = localStorage.getItem("token")
            return editFile(fileId, updates, token)
        },
        onSuccess: () => {
            window.location.reload()
        },
        onError: (err) => {
            alert(err.response?.data?.message || "Failed to update file.")
        },
    })

    const handleDelete = (fileId) => {
        if (window.confirm("Are you sure you want to delete this file?")) {
            deleteMutation.mutate(fileId)
        }
    }

    const handleEdit = (fileId) => {
        const file = files.find((f) => f.id === fileId)
        if (file) {
            setEditingFile(fileId)
            setEditOptions({
                password: file.password || "",
                expiresAt: file.expiresAt ? utcToLocal(file.expiresAt) : "",
                accessLimit:
                    file.accessLimit === null ||
                    file.accessLimit === "unlimited"
                        ? "unlimited"
                        : file.accessLimit,
                isPrivate: file.isPrivate,
            })
        }
    }

    const utcToLocal = (utcDate) => {
        const date = new Date(utcDate)
        const offset = date.getTimezoneOffset() * 60000
        return new Date(date.getTime() - offset).toISOString().slice(0, 16)
    }

    const handleSaveEdit = () => {
        const updates = {
            password: editOptions.password || null,
            expiresAt: editOptions.expiresAt || null,
            accessLimit:
                editOptions.accessLimit === "unlimited"
                    ? null
                    : parseInt(editOptions.accessLimit, 10),
            isPrivate: editOptions.isPrivate,
        }

        editMutation.mutate({ fileId: editingFile, updates })
    }

    const handleFileDetails = (fileId) => {
        navigate(`/file/${fileId}`)
    }

    if (isFilesLoading || isStatsLoading) {
        return <p className="text-white">Loading data...</p>
    }

    if (error) {
        return <p className="text-red-500">{error}</p>
    }

    return (
        <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center p-6">
            <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

            {/* Statystyki użytkownika */}
            {stats && (
                <div className="bg-gray-800 p-4 rounded shadow mb-6 w-full max-w-4xl">
                    <h3 className="text-lg font-bold">User Statistics</h3>
                    <p>Total Files: {stats.totalFiles}</p>
                    <p>
                        Total Storage Used:{" "}
                        {(() => {
                            const size = stats.totalSpaceUsed
                            if (size < 1024) return `${size} B`
                            if (size < 1024 ** 2)
                                return `${(size / 1024).toFixed(2)} KB`
                            if (size < 1024 ** 3)
                                return `${(size / 1024 ** 2).toFixed(2)} MB`
                            return `${(size / 1024 ** 3).toFixed(2)} GB`
                        })()}
                    </p>
                </div>
            )}

            {/* Lista plików */}
            <div className="w-full max-w-4xl space-y-4">
                {files && files.length === 0 ? (
                    <p className="text-gray-400">No files uploaded yet.</p>
                ) : (
                    (files || []).map((file) => (
                        <div
                            key={file.id}
                            className="bg-gray-800 p-4 rounded shadow flex justify-between items-center"
                        >
                            <div>
                                <h3 className="text-lg font-bold">
                                    {file.originalName}
                                </h3>
                                <p className="text-sm text-gray-400">
                                    Size: {(file.size / 1024).toFixed(2)} KB |
                                    Expires:{" "}
                                    {file.expiresAt
                                        ? new Date(
                                              file.expiresAt
                                          ).toLocaleString()
                                        : "Never"}
                                </p>
                                <p className="text-sm text-gray-400">
                                    Status:{" "}
                                    {file.isPrivate ? "Private" : "Public"}
                                </p>
                                <p className="text-sm text-gray-400">
                                    Downloads:{" "}
                                    {`${file.downloads}/${
                                        file.accessLimit || "∞"
                                    }`}
                                </p>
                            </div>
                            <div className="flex space-x-2">
                                <button
                                    onClick={() => handleEdit(file.id)}
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={() => handleDelete(file.id)}
                                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
                                >
                                    Delete
                                </button>
                                <button
                                    onClick={() => handleFileDetails(file.id)}
                                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
                                >
                                    View Details
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Modal edycji */}
            {editingFile && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
                    <div className="bg-gray-800 p-6 rounded shadow-lg w-96 space-y-4">
                        <h3 className="text-lg font-bold mb-4">Edit File</h3>
                        <div>
                            <label className="block text-sm mb-1">
                                Password
                            </label>
                            <input
                                type="text"
                                value={editOptions.password}
                                onChange={(e) =>
                                    setEditOptions({
                                        ...editOptions,
                                        password: e.target.value,
                                    })
                                }
                                className="w-full px-4 py-2 rounded bg-gray-700 text-white"
                                placeholder="Optional password"
                            />
                        </div>
                        <div>
                            <label className="block text-sm mb-1">
                                Expiration Date
                            </label>
                            <input
                                type="datetime-local"
                                value={editOptions.expiresAt}
                                onChange={(e) =>
                                    setEditOptions({
                                        ...editOptions,
                                        expiresAt: e.target.value,
                                    })
                                }
                                className="w-full px-4 py-2 rounded bg-gray-700 text-white"
                            />
                        </div>
                        <div>
                            <label className="block text-sm mb-1">
                                Usage Limit
                            </label>
                            <input
                                type="number"
                                value={
                                    editOptions.accessLimit === "unlimited"
                                        ? ""
                                        : editOptions.accessLimit
                                }
                                onChange={(e) =>
                                    setEditOptions({
                                        ...editOptions,
                                        accessLimit:
                                            e.target.value === "" ||
                                            e.target.value <= 0
                                                ? "unlimited"
                                                : e.target.value,
                                    })
                                }
                                className="w-full px-4 py-2 rounded bg-gray-700 text-white"
                                placeholder="Unlimited"
                            />
                        </div>
                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                checked={editOptions.isPrivate}
                                onChange={(e) =>
                                    setEditOptions({
                                        ...editOptions,
                                        isPrivate: e.target.checked,
                                    })
                                }
                                className="mr-2"
                            />
                            <label>Private File</label>
                        </div>
                        <div className="flex justify-end space-x-4">
                            <button
                                onClick={() => setEditingFile(null)}
                                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSaveEdit}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                            >
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Dashboard
