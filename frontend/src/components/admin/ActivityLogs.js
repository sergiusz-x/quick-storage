import React from "react"
import { useQuery } from "@tanstack/react-query"
import api from "../../services/api"

function ActivityLogs() {
    const { data: logs, isLoading } = useQuery({
        queryKey: ["activityLogs"],
        queryFn: async () => {
            const response = await api.get("/admin/logs")
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

    const formatDetails = (details) => {
        if (!details) return "-"
        try {
            details = JSON.parse(details)
            return Object.entries(details)
                .map(([key, value]) => `${key}: ${value || "N/A"}`)
                .join(", ")
        } catch (error) {
            return "Error parsing details"
        }
    }

    return (
        <div>
            <h2 className="text-2xl font-bold mb-4">Activity Logs</h2>
            {isLoading ? (
                <p>Loading logs...</p>
            ) : (
                <table className="w-full text-left">
                    <thead>
                        <tr>
                            <th className="border-b border-gray-700 p-2">
                                User
                            </th>
                            <th className="border-b border-gray-700 p-2">
                                Action
                            </th>
                            <th className="border-b border-gray-700 p-2">
                                Details
                            </th>
                            <th className="border-b border-gray-700 p-2">
                                Date
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {logs.map((log) => (
                            <tr key={log.id}>
                                <td className="border-b border-gray-700 p-2">
                                    {formatUsername(log)}
                                </td>
                                <td className="border-b border-gray-700 p-2">
                                    {log.action}
                                </td>
                                <td className="border-b border-gray-700 p-2">
                                    {formatDetails(log.details)}
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

export default ActivityLogs
