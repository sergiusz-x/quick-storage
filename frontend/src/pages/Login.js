import React, { useState } from "react"
import { useMutation } from "@tanstack/react-query"
import { loginUser } from "../services/auth"
import { useNavigate } from "react-router-dom"

function Login() {
    const [formData, setFormData] = useState({ username: "", password: "" })
    const [error, setError] = useState(null)
    const navigate = useNavigate()

    const loginMutation = useMutation({
        mutationFn: loginUser,
        onSuccess: (data) => {
            if (data.success) {
                localStorage.setItem("token", data.data.token)
                navigate("/dashboard")
            } else {
                setError(data.message)
            }
        },
        onError: (err) => {
            setError(
                err.response?.data?.message || "Login failed. Please try again."
            )
        },
    })

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData({ ...formData, [name]: value })
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        setError(null)
        loginMutation.mutate(formData)
    }

    return (
        <div className="flex justify-center items-center h-screen bg-gray-900 text-white">
            <form
                onSubmit={handleSubmit}
                className="bg-gray-800 p-6 rounded shadow-lg w-full max-w-md space-y-4"
            >
                <h2 className="text-2xl font-bold text-center mb-4">Login</h2>
                {error && <p className="text-red-500 text-sm">{error}</p>}

                <div>
                    <label className="block text-sm font-medium mb-1">
                        Username
                    </label>
                    <input
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        className="w-full px-4 py-2 rounded bg-gray-700 text-white"
                        placeholder="Enter your username"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">
                        Password
                    </label>
                    <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        className="w-full px-4 py-2 rounded bg-gray-700 text-white"
                        placeholder="Enter your password"
                    />
                </div>

                <button
                    type="submit"
                    className="w-full py-2 bg-blue-600 hover:bg-blue-700 rounded text-white font-bold"
                    disabled={loginMutation.isLoading}
                >
                    {loginMutation.isLoading ? "Logging in..." : "Login"}
                </button>
            </form>
        </div>
    )
}

export default Login
