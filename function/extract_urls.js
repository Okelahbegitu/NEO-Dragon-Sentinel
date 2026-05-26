function extract_urls(text) {

    if (!text) return [];

    return text.match(
        /https?:\/\/[^\s]+|www\.[^\s]+/gi
    ) || [];
}

module.exports = extract_urls;