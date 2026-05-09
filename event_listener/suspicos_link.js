const { Events, PermissionsBitField } = require("discord.js");
const config = require("../models/config_tb");
require("dotenv").config();
const axios = require("axios");

function normalizeUrl(rawUrl) {
    if (!rawUrl) return null;

    // Bersihkan karakter yang sering ikut kebawa dari chat Discord.
    const cleanedUrl = rawUrl
        .trim()
        .replace(/^[<(["']+/, "")
        .replace(/[>)]+["']*$/, "")
        .replace(/[.,!?]+$/, "")
        .replace(/^\/+/, "");

    if (!cleanedUrl) return null;

    if (/^https?:\/\//i.test(cleanedUrl)) {
        return cleanedUrl;
    }

    if (/^www\./i.test(cleanedUrl)) {
        return `https://${cleanedUrl}`;
    }

    return `https://${cleanedUrl}`;
}

module.exports = {
    name: Events.MessageCreate,
    async execute(message) {
        if (message.author.bot) return;
        if (!message.guild) return;
        if (!message.content) {
            console.warn(
                `Empty message content in guild ${message.guild.id}. Enable Message Content Intent in the Discord Developer Portal.`
            );
            return;
        }
        const redflag_domain = ['.xyz', '.top', '.club', '.online', '.site', '.website', '.space', '.tech', '.store', '.info', '.biz', '.io', 'vercel.app', 'netlify.app', 'suspicos.com', 'suspicos.net', 'suspicos.org'];
        const urlMatches = message.content.match(/https?:\/\/\S+|www\.\S+/gi) ?? [];
        const content = message.content.toLowerCase();

        const hasSuspiciousHint = redflag_domain.some((domain) => content.includes(domain));
        const urlsToCheck = urlMatches.length > 0 ? urlMatches : (hasSuspiciousHint ? [message.content] : []);

        // Kalau tidak ada URL yang bisa diuji, hentikan di sini.
        if (urlsToCheck.length === 0) return;

        if (message.guild?.ownerId === message.author.id) return;

        const filter_channel = await config.findOne({ where: { key_name: 'filter_channel' } });
        if (!filter_channel) {
            console.warn(`Filter channel not configured for guild ${message.guild.id}`);
            return;
        }

        const channel = message.guild.channels.cache.get(filter_channel.channelId);
        if (!channel) {
            console.warn(`Filter channel ${filter_channel.channelId} not found in guild ${message.guild.id}`);
            return;
        }

        try {
            for (const rawUrl of urlsToCheck) {
                // Ubah format pesan jadi URL yang aman dikirim ke VirusTotal.
                const normalizedUrl = normalizeUrl(rawUrl);

                if (!normalizedUrl) {
                    console.warn(`Skipped invalid URL from ${message.author.tag}:`, rawUrl);
                    continue;
                }

                // Kirim URL ke VirusTotal untuk dibuat analisis.
                const response = await axios.post(
                    "https://www.virustotal.com/api/v3/urls",
                    new URLSearchParams({ url: normalizedUrl }).toString(),
                    {
                        headers: {
                            accept: 'application/json',
                            'content-type': 'application/x-www-form-urlencoded',
                            "x-apikey": process.env.TOTAL_VIRUS_KEY,
                        },
                    }
                );

                const id = response.data.data.id;

                // Tunggu sebentar supaya hasil analisis VirusTotal siap diambil.
                await new Promise((resolve) => setTimeout(resolve, 3000));

                // Ambil hasil analisis URL dari VirusTotal.
                const analisisResponse = await axios.get(`https://www.virustotal.com/api/v3/analyses/${id}`, {
                    headers: {
                        accept: 'application/json',
                        "x-apikey": process.env.TOTAL_VIRUS_KEY,
                    },
                });

                const analisisData = analisisResponse.data.data.attributes.stats;
                const isSafe = analisisData.malicious === 0 && analisisData.suspicious === 0;

                if (!isSafe) {
                    await channel.send(`Link yang dibagikan oleh ${message.author} terdeteksi sebagai Suspicos! Link: ${normalizedUrl}`);
                    await message.delete();
                    console.log(`User ${message.author.tag} has been flagged for sharing Suspicos link.`);
                }
            }
        } catch (error) {
            const vtError = error.response?.data?.error;
            if (vtError) {
                console.error(`VirusTotal rejected link from ${message.author.tag}:`, vtError);
            } else {
                console.error(`Error checking link from ${message.author.tag}:`, error);
            }
        }
    }
}