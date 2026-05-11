function truncateMarkdown(text, maxLength = 4096) {
    if (text.length <= maxLength) return [text];

    const chunks = [];
    
    // Pecah per heading
    const sections = text.split(/(?=\n#)/); // split sebelum \n#

    let currentChunk = '';

    for (const section of sections) {
        // Kalau ditambah section masih muat
        if ((currentChunk + section).length <= maxLength) {
            currentChunk += section;
        } else {
            // Tidak muat — simpan chunk sekarang, mulai chunk baru
            if (currentChunk) chunks.push(currentChunk.trim());
            currentChunk = section;
        }
    }

    // Sisa terakhir
    if (currentChunk) chunks.push(currentChunk.trim());

    return chunks;
}

module.exports = truncateMarkdown;