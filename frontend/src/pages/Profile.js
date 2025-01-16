import React, { useState } from "react"
import { useMutation } from "@tanstack/react-query"
import { changePassword } from "../services/auth"

function Profile() {
    const [formData, setFormData] = useState({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
    })
    const [error, setError] = useState(null)
    const [success, setSuccess] = useState(null)

    const changePasswordMutation = useMutation({
        mutationFn: (passwordData) =>
            changePassword(passwordData, localStorage.getItem("token")),
        onSuccess: () => {
            setSuccess("Password changed successfully.")
            setFormData({
                oldPassword: "",
                newPassword: "",
                confirmPassword: "",
            })
            setError(null)
        },
        onError: (err) => {
            setError(
                err.response?.data?.message || "Failed to change password."
            )
        },
    })

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData({ ...formData, [name]: value })
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        if (formData.newPassword !== formData.confirmPassword) {
            setError("New passwords do not match.")
            return
        }

        setError(null)
        setSuccess(null)
        changePasswordMutation.mutate({
            oldPassword: formData.oldPassword,
            newPassword: formData.newPassword,
        })
    }

    return (
        <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-6">
            <h1 className="text-3xl font-bold mb-6">Your Profile</h1>
            <form
                onSubmit={handleSubmit}
                className="bg-gray-800 p-6 rounded shadow-lg w-full max-w-md space-y-4"
            >
                {error && <p className="text-red-500 text-sm">{error}</p>}
                {success && <p className="text-green-500 text-sm">{success}</p>}

                <div>
                    <label className="block text-sm font-medium mb-1">
                        Old Password
                    </label>
                    <input
                        type="password"
                        name="oldPassword"
                        value={formData.oldPassword}
                        onChange={handleChange}
                        className="w-full px-4 py-2 rounded bg-gray-700 text-white"
                        placeholder="Enter old password"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">
                        New Password
                    </label>
                    <input
                        type="password"
                        name="newPassword"
                        value={formData.newPassword}
                        onChange={handleChange}
                        className="w-full px-4 py-2 rounded bg-gray-700 text-white"
                        placeholder="Enter new password"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">
                        Confirm New Password
                    </label>
                    <input
                        type="password"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className="w-full px-4 py-2 rounded bg-gray-700 text-white"
                        placeholder="Confirm new password"
                        required
                    />
                </div>

                <button
                    type="submit"
                    className="w-full py-2 bg-blue-600 hover:bg-blue-700 rounded text-white font-bold"
                    disabled={changePasswordMutation.isLoading}
                >
                    {changePasswordMutation.isLoading
                        ? "Changing Password..."
                        : "Change Password"}
                </button>
            </form>
        </div>
    )
}

export default Profile
