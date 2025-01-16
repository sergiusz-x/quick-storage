import axios from "axios"

const API_URL = process.env.REACT_APP_API_URL

export const getPendingAccounts = async (token) => {
    const response = await axios.get(`${API_URL}/admin/pending-accounts`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    })
    return response.data
}

export const approveAccount = async (userId, token) => {
    const response = await axios.patch(
        `${API_URL}/admin/approve-account/${userId}`,
        {},
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    )
    return response.data
}

export const rejectAccount = async (userId, token) => {
    const response = await axios.patch(
        `${API_URL}/admin/reject-account/${userId}`,
        {},
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    )
    return response.data
}

export const getActivityLogs = async (token, params = {}) => {
    const response = await axios.get(`${API_URL}/admin/logs`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
        params,
    })
    return response.data
}

export const getFileAccessLogs = async (token, params = {}) => {
    const response = await axios.get(`${API_URL}/admin/file-access-logs`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
        params,
    })
    return response.data
}

export const getSystemSettings = async (token) => {
    const response = await axios.get(`${API_URL}/admin/settings`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    })
    return response.data
}

export const updateSystemSettings = async (settingsData, token) => {
    const response = await axios.patch(
        `${API_URL}/admin/settings`,
        settingsData,
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    )
    return response.data
}

export const getUsers = async () => {
    const response = await axios.get(`${API_URL}/admin/users`, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
    })
    return response.data
}

export const activateUser = async (userId) => {
    const response = await axios.patch(
        `${API_URL}/admin/users/${userId}/activate`,
        {},
        {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
        }
    )
    return response.data
}

export const deactivateUser = async (userId) => {
    const response = await axios.patch(
        `${API_URL}/admin/users/${userId}/deactivate`,
        {},
        {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
        }
    )
    return response.data
}

export const getGlobalStats = async (token) => {
    const response = await axios.get(`${API_URL}/admin/stats`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    })
    return response.data
}
