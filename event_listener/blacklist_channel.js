const { Events } = require("discord.js");
const axios = require("axios");
const extractUrls = require("../function/extract_urls");

module.exports = {
    name: Events.MessageCreate,
    async execute(message) {
        if (!message.guild) return;
        if (message.author.bot) return;

        // Daftar channel YouTube yang ingin diblokir.
        const blacklistChannel = [
            'LordEndoHD'
        ]

        // Ambil isi pesan, lalu hentikan kalau kosong.
        const content = message.content || "";
        if (!content) return;

        // Normalisasi nama supaya perbandingan tidak sensitif huruf besar/kecil atau awalan @.
        const normalize = (value) => value.toLowerCase().replace(/^@/, "").trim();

        // Ubah link Shorts / youtu.be / embed ke format watch URL standar.
        const toCanonicalYoutubeUrl = (rawUrl) => {
            try {
                const url = new URL(rawUrl.startsWith("http") ? rawUrl : `https://${rawUrl}`);
                const hostname = url.hostname.replace(/^www\./, "").replace(/^m\./, "");

                if (hostname === "youtu.be") {
                    const videoId = url.pathname.split("/").filter(Boolean)[0];
                    return videoId ? `https://www.youtube.com/watch?v=${videoId}` : rawUrl;
                }

                if (hostname.endsWith("youtube.com")) {
                    const pathParts = url.pathname.split("/").filter(Boolean);
                    if (pathParts[0] === "shorts" || pathParts[0] === "embed" || pathParts[0] === "live") {
                        const videoId = pathParts[1];
                        return videoId ? `https://www.youtube.com/watch?v=${videoId}` : rawUrl;
                    }
                }

                return rawUrl;
            } catch {
                return rawUrl;
            }
        };

        // Ambil nama channel/uploader dari URL YouTube lewat oEmbed.
        const getYoutubeAuthorName = async (rawUrl) => {
            const canonicalUrl = toCanonicalYoutubeUrl(rawUrl);

            try {
                const response = await axios.get("https://www.youtube.com/oembed", {
                    params: {
                        url: canonicalUrl,
                        format: "json"
                    },
                    timeout: 10000
                });

                return normalize(response.data?.author_name || "");
            } catch {
                return null;
            }
        };

        // Cari semua URL di pesan, lalu filter hanya URL YouTube.
        const urls = extractUrls(content);
        const youtubeUrls = urls.filter((rawUrl) => {
            try {
                const hostname = new URL(rawUrl.startsWith("http") ? rawUrl : `https://${rawUrl}`).hostname.replace(/^www\./, "").replace(/^m\./, "");
                return hostname === "youtu.be" || hostname.endsWith("youtube.com");
            } catch {
                return false;
            }
        });

        // Cek kecocokan langsung dari teks pesan.
        const shouldDeleteByText = blacklistChannel.some((channelName) => {
            const normalizedName = normalize(channelName);

            return content.toLowerCase().includes(normalizedName);
        });

        // Cek apakah uploader dari video YouTube ada di blacklist.
        const shouldDeleteByVideoAuthor = await Promise.all(
            youtubeUrls.map(async (rawUrl) => {
                const authorName = await getYoutubeAuthorName(rawUrl);
                if (!authorName) return false;

                return blacklistChannel.some((channelName) => normalize(channelName) === authorName);
            })
        ).then((results) => results.some(Boolean));

        const shouldDelete = shouldDeleteByText || shouldDeleteByVideoAuthor;

        // Hapus pesan kalau ketemu kecocokan.
        if (shouldDelete) {
            await message.delete().catch(() => null);
        }
    }
}