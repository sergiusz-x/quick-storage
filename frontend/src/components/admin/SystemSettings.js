import React, { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import api from "../../services/api"

function SystemSettings() {
    const queryClient = useQueryClient()
    const [formData, setFormData] = useState(null)

    const { isLoading } = useQuery({
        queryKey: ["settings"],
        queryFn: async () => {
            const response = await api.get("/admin/settings")
            setFormData(response.data.data.settings)
            return response.data.data.settings
        },
    })

    const updateMutation = useMutation({
        mutationFn: async (newSettings) => {
            await api.patch("/admin/settings", newSettings)
        },
        onSuccess: () => {
            queryClient.invalidateQueries(["settings"])
            alert("Settings updated successfully.")
        },
        onError: () => {
            alert("Failed to update settings.")
        },
    })

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        })
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        updateMutation.mutate(formData)
    }

    return (
        <div>
            <h2 className="text-2xl font-bold mb-4">System Settings</h2>
            {isLoading ? (
                <p>Loading settings...</p>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block mb-2">
                            Max File Size (bytes)
                        </label>
                        <input
                            type="number"
                            name="maxFileSize"
                            value={formData?.maxFileSize || ""}
                            onChange={handleChange}
                            className="w-full px-4 py-2 rounded bg-gray-700 text-white"
                        />
                    </div>
                    {/* <div>
                        <label className="block mb-2">
                            Default Expiration (hours)
                        </label>
                        <input
                            type="number"
                            name="defaultExpirationHours"
                            value={formData?.defaultExpirationHours || ""}
                            onChange={handleChange}
                            className="w-full px-4 py-2 rounded bg-gray-700 text-white"
                        />
                    </div> */}
                    <div>
                        <label className="block mb-2">
                            Max Anonymous File Size (bytes)
                        </label>
                        <input
                            type="number"
                            name="maxAnonymousFileSize"
                            value={formData?.maxAnonymousFileSize || ""}
                            onChange={handleChange}
                            className="w-full px-4 py-2 rounded bg-gray-700 text-white"
                        />
                    </div>
                    <div>
                        <label className="block mb-2">
                            Max Anonymous Expiration (hours)
                        </label>
                        <input
                            type="number"
                            name="maxAnonymousFileExpirationHours"
                            value={
                                formData?.maxAnonymousFileExpirationHours || ""
                            }
                            onChange={handleChange}
                            className="w-full px-4 py-2 rounded bg-gray-700 text-white"
                        />
                    </div>
                    <button
                        type="submit"
                        className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded text-white font-bold"
                        disabled={updateMutation.isLoading}
                    >
                        {updateMutation.isLoading
                            ? "Updating..."
                            : "Update Settings"}
                    </button>
                </form>
            )}
        </div>
    )
}

export default SystemSettings
