import React, { useState, useEffect } from "react"
import { useParams } from "react-router-dom"

function FileSummary() {
    const { fileId } = useParams()
    const [fileDetails, setFileDetails] = useState(null)
    const [error, setError] = useState(null)
    const [password, setPassword] = useState("")
    const [isPasswordRequired, setIsPasswordRequired] = useState(false)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const fetchFileDetails = async () => {
            try {
                const response = await fetch(
                    `${process.env.REACT_APP_API_URL}/files/${fileId}`,
                    {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem(
                                "token"
                            )}`,
                        },
                    }
                )
                const result = await response.json()

                if (result?.success) {
                    setFileDetails(result.data)
                    setError(null)
                } else if (result.message === "Invalid file password.") {
                    setIsPasswordRequired(true)
                    setError(" ")
                } else {
                    setError(result.message || "Failed to fetch file details.")
                }
            } catch (err) {
                console.error(err)
                setError("An unexpected error occurred.")
            } finally {
                setIsLoading(false)
            }
        }

        fetchFileDetails()
    }, [fileId])

    const handlePasswordSubmit = async (e) => {
        e.preventDefault()
        try {
            const response = await fetch(
                `${process.env.REACT_APP_API_URL}/files/verify-password`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        fileId,
                        password,
                    }),
                }
            )

            const result = await response.json()

            if (response.ok) {
                setFileDetails(result.data)
                setIsPasswordRequired(false)
                setError(null)
            } else {
                setError(result.message || "Invalid password.")
            }
        } catch (err) {
            console.error(err)
            setError("An unexpected error occurred.")
        }
    }

    const handleCopyLink = () => {
        navigator.clipboard
            .writeText(`${window.location.origin}/file/${fileId}`)
            .then(() => {
                alert("Link copied to clipboard!")
            })
    }

    const handleDownload = async () => {
        try {
            const response = await fetch(
                `${process.env.REACT_APP_API_URL}/files/download/${fileId}`,
                {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem(
                            "token"
                        )}`,
                        "X-File-Password": fileDetails.passwordProtected
                            ? password
                            : "",
                    },
                }
            )

            if (response.ok) {
                const blob = await response.blob()
                const url = window.URL.createObjectURL(blob)
                const a = document.createElement("a")
                a.href = url
                a.download = fileDetails.originalName
                a.click()
                window.URL.revokeObjectURL(url)
            } else {
                const result = await response.json()
                setError(result.message || "Failed to download file.")
            }
        } catch (err) {
            console.error(err)
            setError("An unexpected error occurred.")
        }
    }

    if (isLoading) {
        return (
            <p className="text-gray-400 text-center">Loading file details...</p>
        )
    }

    if (error && isPasswordRequired) {
        return (
            <div className="min-h-screen bg-gray-900 text-white flex flex-col justify-center items-center p-6">
                <h1 className="text-4xl font-bold mb-6">File Summary</h1>
                <form
                    onSubmit={handlePasswordSubmit}
                    className="bg-gray-800 p-6 rounded shadow-lg w-full max-w-md"
                >
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                        Enter Password to Access File
                    </label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-4 py-2 rounded bg-gray-700 text-white mb-4"
                        placeholder="File password"
                    />
                    <button
                        type="submit"
                        className="w-full py-2 bg-blue-600 hover:bg-blue-700 rounded text-white font-bold"
                    >
                        Submit
                    </button>
                    {error && (
                        <p className="text-red-500 text-center mt-4">{error}</p>
                    )}
                </form>
            </div>
        )
    }

    if (error) {
        return <p className="text-red-500 text-center">{error}</p>
    }

    return (
        <div className="min-h-screen bg-gray-900 text-white flex flex-col justify-center items-center p-6">
            <h1 className="text-4xl font-bold mb-6">File Summary</h1>
            <div className="bg-gray-800 p-6 rounded shadow-lg w-full max-w-lg space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-400">
                        File Name
                    </label>
                    <p className="text-lg font-bold">
                        {fileDetails.originalName}
                    </p>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-400">
                        File Size
                    </label>
                    <p className="text-lg">
                        {(fileDetails.size / 1024).toFixed(2)} KB
                    </p>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-400">
                        Privacy
                    </label>
                    <p className="text-lg">
                        {fileDetails.isPrivate ? "Private" : "Public"}
                    </p>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-400">
                        Expiration
                    </label>
                    <p className="text-lg">
                        {fileDetails.expiresAt
                            ? new Date(fileDetails.expiresAt).toLocaleString()
                            : "Never"}
                    </p>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-400">
                        File Link
                    </label>
                    <div className="flex items-center">
                        <input
                            type="text"
                            value={`${window.location.origin}/file/${fileId}`}
                            readOnly
                            className="w-full px-4 py-2 rounded bg-gray-700 text-white mr-2"
                        />
                        <button
                            onClick={handleCopyLink}
                            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-white font-bold"
                        >
                            Copy
                        </button>
                    </div>
                </div>
                <button
                    onClick={handleDownload}
                    className="w-full py-2 bg-green-600 hover:bg-green-700 rounded text-white font-bold mt-4"
                >
                    Download File
                </button>
            </div>
        </div>
    )
}

export default FileSummary
