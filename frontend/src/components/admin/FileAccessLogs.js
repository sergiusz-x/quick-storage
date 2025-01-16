import React from "react"
import { useQuery } from "@tanstack/react-query"
import api from "../../services/api"

function FileAccessLogs() {
    const { data: logs, isLoading } = useQuery({
        queryKey: ["fileAccessLogs"],
        queryFn: async () => {
            const response = await api.get("/admin/file-access-logs")
            return response.data.data.logs
        },
    })

    const formatDate = (isoString) => {
        const date = new Date(isoString)
        return date.toLocaleString()
    }

    const formatUsername = (log) => {
        const username = log?.username
        if (!username) return "Anonymous"
        return username + ` [${log.userId}]`
    }

    return (
        <div>
            <h2 className="text-2xl font-bold mb-4">File Access Logs</h2>
            {isLoading ? (
                <p>Loading file access logs...</p>
            ) : (
                <table className="w-full text-left">
                    <thead>
                        <tr>
                            <th className="border-b border-gray-700 p-2">
                                File
                            </th>
                            <th className="border-b border-gray-700 p-2">
                                Accessed By
                            </th>
                            <th className="border-b border-gray-700 p-2">
                                Timestamp
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {logs.map((log) => (
                            <tr key={log.id}>
                                <td className="border-b border-gray-700 p-2">
                                    {log.fileName}
                                </td>
                                <td className="border-b border-gray-700 p-2">
                                    {formatUsername(log)}
                                </td>
                                <td className="border-b border-gray-700 p-2">
                                    {formatDate(log.createdAt)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    )
}

export default FileAccessLogs
