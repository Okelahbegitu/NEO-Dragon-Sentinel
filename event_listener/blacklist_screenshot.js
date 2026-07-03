const {
    Events,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} = require("discord.js");

const axios = require("axios");
const FormData = require("form-data");

const env = require("../config/env");

const SCAN_TIMEOUT_MS = 15000;
const MAX_SCAN_RETRIES = 1;

async function downloadAttachment(url) {
    const imageResponse = await axios.get(url, {
        responseType: "arraybuffer",
        timeout: SCAN_TIMEOUT_MS
    });
    return Buffer.from(imageResponse.data);
}

function isRetryableScanError(error) {
    return ["ECONNRESET", "ETIMEDOUT", "EPIPE", "ECONNABORTED"].includes(error?.code);
}

function buildScanForm(buffer, media) {
    const form = new FormData();
    form.append("image", buffer, {
        filename: media.name || "image.png",
        contentType: media.contentType || "image/png"
    });
    return form;
}

async function postScan(buffer, media) {
    const form = buildScanForm(buffer, media);

    return axios.post(
        `${env.API_URL}/scan-alter`,
        form,
        {
            headers: form.getHeaders(),
            maxBodyLength: Infinity,
            maxContentLength: Infinity,
            timeout: SCAN_TIMEOUT_MS
        }
    );
}

module.exports = {
    name: Events.MessageCreate,

    async execute(message) {
        if (!message.guild) return;
        if (message.author.bot) return;

        try {
            const medias = [...message.attachments.values()].filter(
                attachment => attachment.contentType?.startsWith("image/")
            );

            if (!medias.length) return;

            for (const media of medias) {
                // Download buffer sekali, dipakai untuk scan + DM + report
                const buffer = await downloadAttachment(media.url);

                let result;

                for (let attempt = 0; attempt <= MAX_SCAN_RETRIES; attempt += 1) {
                    try {
                        result = await postScan(buffer, media);
                        break;
                    } catch (error) {
                        if (attempt >= MAX_SCAN_RETRIES || !isRetryableScanError(error)) {
                            throw error;
                        }

                        console.warn(
                            `Scan-alter request failed for ${media.url}, retrying once:`,
                            error.code || error.message
                        );
                    }
                }

                console.log(`Scan result for ${media.url}:`, result.data);

                if (result.data.data.targetFound) {
                    //hapus pesanya aja
                    await message.delete();
                }
            }
        } catch (error) {
            console.error('Error in blacklist_screenshot:', error);
        }
    }
}