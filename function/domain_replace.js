function isMediaLink(url) {
    if (url.includes("tiktok.com") || url.includes("instagram.com") || url.includes("x.com") || url.includes("twitter.com")) {
        return url
            .replace("tiktok.com", "kktiktok.com")
            .replace("instagram.com", "kkinstagram.com")
            .replace("x.com", "fixupx.com")
            .replace("twitter.com", "fixupx.com");
    }
    return false;
}

module.exports = isMediaLink;