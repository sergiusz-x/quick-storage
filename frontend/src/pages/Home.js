import React, { useState } from "react"
import { useMutation } from "@tanstack/react-query"
import { uploadFile } from "../services/fileService"
import { useNavigate } from "react-router-dom"

function Home() {
    const [file, setFile] = useState(null)
    const [options, setOptions] = useState({
        isPrivate: false,
        password: "",
        expires: "24h",
        accessLimit: "unlimited",
    })
    const [error, setError] = useState(null)

    const isLoggedIn = Boolean(localStorage.getItem("token"))
    const navigate = useNavigate()

    const uploadMutation = useMutation({
        mutationFn: (data) => uploadFile(data, localStorage.getItem("token")),
        onSuccess: (data) => {
            if (data.success) {
                navigate(`/file/${data.data.fileId}`)
            } else {
                setError(
                    data.message ||
                        "An error occurred while uploading the file."
                )
            }
        },
        onError: (err) => {
            setError(err.response?.data?.message || "Failed to upload file.")
        },
    })

    const handleFileChange = (e) => {
        setFile(e.target.files[0])
    }

    const handleOptionChange = (e) => {
        const { name, value, type, checked } = e.target
        setOptions({
            ...options,
            [name]: type === "checkbox" ? checked : value,
        })
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        const expiresAt =
            options.expires === "unlimited"
                ? null
                : calculateExpirationDate(options.expires)

        uploadMutation.mutate({
            file,
            isPrivate: options.isPrivate,
            password: options.password || null,
            expiresAt,
            accessLimit:
                options.accessLimit === "unlimited"
                    ? null
                    : options.accessLimit,
        })
    }

    const calculateExpirationDate = (expiresOption) => {
        const durations = {
            "24h": 1,
            "7d": 7,
            "14d": 14,
            "31d": 31,
            "3m": 90,
            "6m": 180,
            "9m": 270,
            "1y": 365,
        }
        const daysToAdd = durations[expiresOption]
        if (!daysToAdd) return null
        const expirationDate = new Date()
        expirationDate.setDate(expirationDate.getDate() + daysToAdd)
        return expirationDate.toISOString()
    }

    return (
        <div className="min-h-screen bg-gray-900 text-white flex flex-col justify-center items-center p-6">
            <h1 className="text-4xl font-bold mb-6">
                Welcome to Quick Storage
            </h1>
            <form
                onSubmit={handleSubmit}
                className="bg-gray-800 p-6 rounded shadow-lg w-full max-w-lg space-y-4"
            >
                <div>
                    <label className="block text-sm font-medium mb-2">
                        Select File
                    </label>
                    <div className="relative flex items-center justify-center border-2 border-dashed border-gray-600 rounded h-24 cursor-pointer">
                        <input
                            type="file"
                            onChange={handleFileChange}
                            className="absolute inset-0 opacity-0 cursor-pointer"
                        />
                        {file ? (
                            <p>{file.name}</p>
                        ) : (
                            <p className="text-gray-400">
                                Click here to upload a file
                            </p>
                        )}
                    </div>
                </div>

                <div className="space-y-2">
                    <div className="flex items-center relative group">
                        <input
                            type="checkbox"
                            name="isPrivate"
                            checked={options.isPrivate}
                            onChange={handleOptionChange}
                            className={`mr-2 h-5 w-5 accent-blue-600 rounded ${
                                !isLoggedIn ? "cursor-not-allowed" : ""
                            }`}
                            disabled={!isLoggedIn}
                        />
                        <label htmlFor="isPrivate" className="cursor-pointer">
                            Private File
                        </label>
                        {!isLoggedIn && (
                            <div className="absolute left-0 top-8 bg-gray-700 text-white text-sm px-4 py-2 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
                                Login required to set private files
                            </div>
                        )}
                    </div>

                    <div className="relative group">
                        <label className="block text-sm font-medium mb-1">
                            Password
                        </label>
                        <input
                            type="password"
                            name="password"
                            value={options.password}
                            onChange={handleOptionChange}
                            className={`w-full px-4 py-2 rounded bg-gray-700 text-white ${
                                !isLoggedIn ? "cursor-not-allowed" : ""
                            }`}
                            placeholder="Optional password"
                            disabled={!isLoggedIn}
                            maxLength={50}
                        />
                        {!isLoggedIn && (
                            <div className="absolute left-0 top-10 bg-gray-700 text-white text-sm px-4 py-2 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
                                Login required to set a password
                            </div>
                        )}
                    </div>

                    <div className="relative group">
                        <label className="block text-sm font-medium mb-1">
                            Expiration
                        </label>
                        <select
                            name="expires"
                            value={options.expires}
                            onChange={handleOptionChange}
                            className={`w-full px-4 py-2 rounded bg-gray-700 text-white ${
                                !isLoggedIn ? "cursor-not-allowed" : ""
                            }`}
                            disabled={!isLoggedIn}
                        >
                            <option value="24h">24 hours</option>
                            <option value="7d">7 days</option>
                            <option value="14d">14 days</option>
                            <option value="31d">1 month</option>
                            <option value="3m">3 months</option>
                            <option value="6m">6 months</option>
                            <option value="9m">9 months</option>
                            <option value="1y">1 year</option>
                            <option value="unlimited">Unlimited</option>
                        </select>
                        {!isLoggedIn && (
                            <div className="absolute left-0 top-10 bg-gray-700 text-white text-sm px-4 py-2 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
                                Login required to change expiration
                            </div>
                        )}
                    </div>

                    <div className="relative group">
                        <label className="block text-sm font-medium mb-1">
                            Usage Limit
                        </label>
                        <input
                            type="number"
                            name="accessLimit"
                            value={
                                options.accessLimit === "unlimited"
                                    ? ""
                                    : options.accessLimit
                            }
                            onChange={(e) =>
                                setOptions({
                                    ...options,
                                    accessLimit:
                                        e.target.value === "" ||
                                        e.target.value <= 0
                                            ? "unlimited"
                                            : e.target.value,
                                })
                            }
                            className={`w-full px-4 py-2 rounded bg-gray-700 text-white ${
                                !isLoggedIn ? "cursor-not-allowed" : ""
                            }`}
                            placeholder="Unlimited"
                            disabled={!isLoggedIn}
                        />
                        {!isLoggedIn && (
                            <div className="absolute left-0 top-10 bg-gray-700 text-white text-sm px-4 py-2 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
                                Login required to change usage limit
                            </div>
                        )}
                    </div>
                </div>

                {error && <p className="text-red-500 text-sm">{error}</p>}

                <button
                    type="submit"
                    className="w-full py-2 bg-blue-600 hover:bg-blue-700 rounded text-white font-bold"
                    disabled={uploadMutation.isLoading}
                >
                    {uploadMutation.isLoading ? "Uploading..." : "Upload File"}
                </button>
            </form>
        </div>
    )
}

export default Home
