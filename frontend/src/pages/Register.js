import React, { useState } from "react"
import { useMutation } from "@tanstack/react-query"
import { registerUser } from "../services/auth"
import { useNavigate } from "react-router-dom"

function Register() {
    const [formData, setFormData] = useState({
        username: "",
        password: "",
        confirmPassword: "",
    })
    const [error, setError] = useState(null)
    const navigate = useNavigate()

    const registerMutation = useMutation({
        mutationFn: registerUser,
        onSuccess: (data) => {
            if (data.success) {
                navigate("/")
                alert("Registration successful! You can now log in.")
            } else {
                setError(
                    data.message || "An error occurred during registration."
                )
            }
        },
        onError: (err) => {
            setError(err.response?.data?.message || "Failed to register.")
        },
    })

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData({ ...formData, [name]: value })
    }

    const handleSubmit = (e) => {
        e.preventDefault()

        if (
            !formData.username ||
            !formData.password ||
            !formData.confirmPassword
        ) {
            setError("All fields are required.")
            return
        }

        if (formData.username.length > 30) {
            setError("Username must be less than 30 characters.")
            return
        }

        if (formData.password.length < 8 || formData.password.length > 50) {
            setError("Password must be between 8 and 50 characters.")
            return
        }

        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match.")
            return
        }

        setError(null)
        registerMutation.mutate({
            username: formData.username,
            password: formData.password,
        })
    }

    return (
        <div className="flex justify-center items-center h-screen bg-gray-900 text-white">
            <form
                onSubmit={handleSubmit}
                className="bg-gray-800 p-6 rounded shadow-lg w-full max-w-md space-y-4"
            >
                <h2 className="text-2xl font-bold text-center mb-4">
                    Register
                </h2>
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
                        maxLength={30}
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
                        minLength={8}
                        maxLength={50}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">
                        Confirm Password
                    </label>
                    <input
                        type="password"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className="w-full px-4 py-2 rounded bg-gray-700 text-white"
                        placeholder="Confirm your password"
                    />
                </div>

                <button
                    type="submit"
                    className="w-full py-2 bg-blue-600 hover:bg-blue-700 rounded text-white font-bold"
                    disabled={registerMutation.isLoading}
                >
                    {registerMutation.isLoading ? "Registering..." : "Register"}
                </button>
            </form>
        </div>
    )
}

export default Register
