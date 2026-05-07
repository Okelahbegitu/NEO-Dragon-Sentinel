function generateUniqueId(length = 8, prefix = "id_") {
    const randomNum = Math.random().toString(36).substr(2, length);
    return prefix + randomNum;
}

module.exports = { generateUniqueId };