import axios from "axios"

const API_URL = process.env.REACT_APP_API_URL

export const getUserFileStats = async (token) => {
    const response = await axios.get(`${API_URL}/files/stats`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    })

    if (!response.data.success) {
        throw new Error(response.data.message || "Failed to fetch user stats.")
    }

    return response.data
}


export const getUserFiles = async (token) => {
    const response = await axios.get(`${API_URL}/files`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    })

    if (!response.data.success) {
        throw new Error(response.data.message || "Failed to fetch user files.")
    }

    return response.data
}


export const uploadFile = async (fileData, token) => {
    const formData = new FormData()
    Object.entries(fileData).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
            formData.append(key, value)
        }
    })

    const response = await axios.post(`${API_URL}/files/upload`, formData, {
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
        },
    })

    if (!response.data.success) {
        throw new Error(response.data.message || "File upload failed.")
    }

    return response.data
}


export const editFile = async (fileId, updates, token) => {
    try {
        const response = await axios.patch(
            `${API_URL}/files/${fileId}`,
            updates,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        )

        if (!response.data.success) {
            throw new Error(response.data.message || "Update failed.")
        }

        return response.data.data
    } catch (error) {
        console.error("Error editing file:", error)
        throw error
    }
}


export const deleteFile = async (fileId, token) => {
    const response = await axios.delete(`${API_URL}/files/${fileId}`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    })

    if (!response.data.success) {
        throw new Error(response.data.message || "Failed to delete file.")
    }

    return response.data
}


export const getFileDetails = async (fileId, token) => {
    try {
        const headers = {}

        if (token) {
            headers.Authorization = `Bearer ${token}`
        }

        const response = await axios.get(`${API_URL}/files/${fileId}`, {
            headers,
        })

        if (!response.data.success) {
            throw new Error(
                response.data.message || "Failed to fetch file details."
            )
        }

        return response.data.data
    } catch (err) {
        throw err
    }
}


export const downloadFile = async (fileId, token) => {
    const response = await axios.get(`${API_URL}/files/download/${fileId}`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
        responseType: "blob",
    })

    return response.data
}

export const verifyFilePassword = async (fileId, password) => {
    try {
        const response = await axios.post(`${API_URL}/files/verify-password`, {
            fileId,
            password,
        })

        if (!response.data.success) {
            throw new Error(
                response.data.message || "Password verification failed."
            )
        }

        return response.data.data
    } catch (err) {
        console.error("Error in verifyFilePassword:", err)
        throw err
    }
}
