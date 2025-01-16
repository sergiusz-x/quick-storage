import React from "react"
import { Link, useNavigate } from "react-router-dom"
import { logoutUser } from "../services/auth"

function Navbar() {
    const token = localStorage.getItem("token")
    const isAdmin = token && JSON.parse(atob(token.split(".")[1])).isAdmin
    const navigate = useNavigate()

    const handleLogout = async () => {
        try {
            const token = localStorage.getItem("token")
            await logoutUser(token)
            localStorage.removeItem("token")
            navigate("/")
            window.location.reload()
        } catch (error) {
            console.error("Failed to log out:", error)
        }
    }

    return (
        <nav className="bg-gray-800 text-white p-4">
            <div className="container mx-auto flex justify-between items-center">
                <Link to="/" className="text-xl font-bold">
                    Quick Storage
                </Link>
                <div className="space-x-4">
                    {!token ? (
                        <>
                            <Link to="/login" className="hover:underline">
                                Login
                            </Link>
                            <Link to="/register" className="hover:underline">
                                Register
                            </Link>
                        </>
                    ) : (
                        <>
                            <Link to="/dashboard" className="hover:underline">
                                Dashboard
                            </Link>
                            <Link to="/profile" className="hover:underline">
                                Profile
                            </Link>
                            {isAdmin && (
                                <Link to="/admin" className="hover:underline">
                                    Admin Panel
                                </Link>
                            )}
                            <button
                                onClick={handleLogout}
                                className="hover:underline"
                            >
                                Logout
                            </button>
                        </>
                    )}
                </div>
            </div>
        </nav>
    )
}

export default Navbar
