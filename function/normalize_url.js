function normalize_url(rawUrl) {

    if (!rawUrl) return null;

    const cleanedUrl = rawUrl
        .trim()

        // hapus karakter depan
        .replace(/^[<(["']+/, '')

        // hapus karakter belakang
        .replace(/[>)\]"']+$/, '')

        // hapus tanda baca akhir
        .replace(/[.,!?]+$/, '');

    if (!cleanedUrl) return null;

    // kalau sudah ada http/https
    if (/^https?:\/\//i.test(cleanedUrl)) {
        return cleanedUrl;
    }

    // kalau diawali www
    if (/^www\./i.test(cleanedUrl)) {
        return `https://${cleanedUrl}`;
    }

    // default
    return `https://${cleanedUrl}`;
}

module.exports = normalize_url;