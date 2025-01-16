import axios from "axios"

const API_URL = process.env.REACT_APP_API_URL

export const registerUser = async (userData) => {
    const response = await axios.post(`${API_URL}/auth/register`, userData)
    return response.data
}

export const loginUser = async (credentials) => {
    const response = await axios.post(`${API_URL}/auth/login`, credentials)
    return response.data
}

export const logoutUser = async (token) => {
    const response = await axios.post(`${API_URL}/auth/logout`, null, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    })

    if (!response.data.success) {
        throw new Error(response.data.message || "Logout failed.")
    }

    return response.data
}

export const changePassword = async (passwordData, token) => {
    const response = await axios.patch(
        `${API_URL}/auth/change-password`,
        passwordData,
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    )
    return response.data
}
