function createResponse(success, message, data = null, pagination = null) {
    const response = {
        success,
        message,
        data,
    }

    if (pagination) {
        response.pagination = pagination
    }

    return response
}

module.exports = { createResponse }
