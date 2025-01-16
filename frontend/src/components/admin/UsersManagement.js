import React from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import api from "../../services/api"

function UsersManagement() {
    const queryClient = useQueryClient()

    const { data: users, isLoading } = useQuery({
        queryKey: ["users"],
        queryFn: async () => {
            const response = await api.get("/admin/pending-accounts")
            return response.data.data.pendingAccounts
        },
    })

    const approveMutation = useMutation({
        mutationFn: async (id) => {
            await api.patch(`/admin/approve-account/${id}`)
        },
        onSuccess: () => {
            queryClient.invalidateQueries(["users"])
        },
    })

    const rejectMutation = useMutation({
        mutationFn: async (id) => {
            await api.patch(`/admin/reject-account/${id}`)
        },
        onSuccess: () => {
            queryClient.invalidateQueries(["users"])
        },
    })

    const handleApprove = (id) => approveMutation.mutate(id)
    const handleReject = (id) => rejectMutation.mutate(id)

    return (
        <div>
            <h2 className="text-2xl font-bold mb-4">Approve New Accounts</h2>
            {isLoading ? (
                <p>Loading users...</p>
            ) : (
                <table className="w-full text-left">
                    <thead>
                        <tr>
                            <th className="border-b border-gray-700 p-2">
                                Username
                            </th>
                            <th className="border-b border-gray-700 p-2">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user) => (
                            <tr key={user.id}>
                                <td className="border-b border-gray-700 p-2">
                                    {user.username}
                                </td>
                                <td className="border-b border-gray-700 p-2">
                                    <button
                                        className="bg-green-600 hover:bg-green-700 px-4 py-1 rounded mr-2"
                                        onClick={() => handleApprove(user.id)}
                                    >
                                        Approve
                                    </button>
                                    <button
                                        className="bg-red-600 hover:bg-red-700 px-4 py-1 rounded"
                                        onClick={() => handleReject(user.id)}
                                    >
                                        Reject
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    )
}

export default UsersManagement
