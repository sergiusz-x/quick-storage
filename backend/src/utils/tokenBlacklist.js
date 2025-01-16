const tokenBlacklist = new Set()

function add(token) {
    tokenBlacklist.add(token)
}

function has(token) {
    return tokenBlacklist.has(token)
}

function clear() {
    tokenBlacklist.clear()
}

module.exports = { tokenBlacklist, add, has, clear }
