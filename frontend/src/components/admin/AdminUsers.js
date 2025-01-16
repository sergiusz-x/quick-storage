import React from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
    getUsers,
    activateUser,
    deactivateUser,
} from "../../services/adminService"

function AdminUsers() {
    const queryClient = useQueryClient()

    const { data: users, isLoading } = useQuery({
        queryKey: ["users"],
        queryFn: async () => {
            const response = await getUsers()
            if (!response.success) throw new Error(response.message)
            return response.data.users
        },
        refetchOnWindowFocus: false,
    })

    const activateMutation = useMutation({
        mutationFn: (userId) => activateUser(userId),
        onSuccess: () => {
            queryClient.invalidateQueries(["users"])
        },
        onError: (err) => {
            alert(err.response?.data?.message || "Failed to activate user.")
        },
    })

    const deactivateMutation = useMutation({
        mutationFn: (userId) => deactivateUser(userId),
        onSuccess: () => {
            queryClient.invalidateQueries(["users"])
        },
        onError: (err) => {
            alert(err.response?.data?.message || "Failed to deactivate user.")
        },
    })

    const handleActivate = (userId) => activateMutation.mutate(userId)
    const handleDeactivate = (userId) => deactivateMutation.mutate(userId)

    return (
        <div>
            <h2 className="text-2xl font-bold mb-4">Manage Users</h2>
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
                                Status
                            </th>
                            <th className="border-b border-gray-700 p-2">
                                Role
                            </th>
                            <th className="border-b border-gray-700 p-2">
                                Created At
                            </th>
                            <th className="border-b border-gray-700 p-2">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {users?.map((user) => (
                            <tr key={user.id}>
                                <td className="border-b border-gray-700 p-2">
                                    {user.username}
                                </td>
                                <td className="border-b border-gray-700 p-2">
                                    {user.isActive ? "Active" : "Inactive"}
                                </td>
                                <td className="border-b border-gray-700 p-2">
                                    {user.isAdmin ? "Admin" : "User"}
                                </td>
                                <td className="border-b border-gray-700 p-2">
                                    {new Date(user.createdAt).toLocaleString()}
                                </td>
                                <td className="border-b border-gray-700 p-2">
                                    {user.isActive ? (
                                        <button
                                            className="bg-red-600 hover:bg-red-700 px-4 py-1 rounded mr-2"
                                            onClick={() =>
                                                handleDeactivate(user.id)
                                            }
                                        >
                                            Deactivate
                                        </button>
                                    ) : (
                                        <button
                                            className="bg-blue-600 hover:bg-blue-700 px-4 py-1 rounded"
                                            onClick={() =>
                                                handleActivate(user.id)
                                            }
                                        >
                                            Activate
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    )
}

export default AdminUsers
