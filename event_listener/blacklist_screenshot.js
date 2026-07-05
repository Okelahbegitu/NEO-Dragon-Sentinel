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

const SCAN_TIMEOUT_MS = 20000;
const MAX_SCAN_RETRIES = 3;
const RETRY_DELAY_MS = 1000;

let isApiDown = false;
let apiDownSince = null;

/**
 * Sleep for specified milliseconds
 */
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Mark API as down and log
 */
function markApiDown() {
    if (!isApiDown) {
        isApiDown = true;
        apiDownSince = new Date();
        console.error(`[SCAN-ALTER] API marked as DOWN at ${apiDownSince.toISOString()}`);
    }
}

/**
 * Mark API as up
 */
function markApiUp() {
    if (isApiDown) {
        const downtime = Math.round((Date.now() - apiDownSince) / 1000);
        console.log(`[SCAN-ALTER] API recovered after ${downtime}s`);
        isApiDown = false;
        apiDownSince = null;
    }
}

/**
 * Download attachment with retry logic
 */
async function downloadAttachment(url, attempt = 0) {
    try {
        const imageResponse = await axios.get(url, {
            responseType: "arraybuffer",
            timeout: SCAN_TIMEOUT_MS
        });
        return Buffer.from(imageResponse.data);
    } catch (error) {
        if (attempt < MAX_SCAN_RETRIES && isRetryableScanError(error)) {
            const delayMs = RETRY_DELAY_MS * Math.pow(2, attempt);
            console.warn(
                `[DOWNLOAD] Failed (attempt ${attempt + 1}/${MAX_SCAN_RETRIES + 1}), retrying in ${delayMs}ms:`,
                error.code || error.message
            );
            await sleep(delayMs);
            return downloadAttachment(url, attempt + 1);
        }
        throw error;
    }
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

/**
 * Post scan request with retry logic and exponential backoff
 */
async function postScan(buffer, media, attempt = 0) {
    try {
        const form = buildScanForm(buffer, media);

        const response = await axios.post(
            `${env.API_URL}/scan-alter`,
            form,
            {
                headers: form.getHeaders(),
                maxBodyLength: Infinity,
                maxContentLength: Infinity,
                timeout: SCAN_TIMEOUT_MS
            }
        );

        // Mark API as up if it was down
        if (isApiDown) {
            markApiUp();
        }

        return response;
    } catch (error) {
        if (attempt < MAX_SCAN_RETRIES && isRetryableScanError(error)) {
            const delayMs = RETRY_DELAY_MS * Math.pow(2, attempt);
            console.warn(
                `[SCAN-ALTER] Failed (attempt ${attempt + 1}/${MAX_SCAN_RETRIES + 1}), retrying in ${delayMs}ms:`,
                error.code || error.message
            );
            await sleep(delayMs);
            return postScan(buffer, media, attempt + 1);
        }

        // Mark API as down after max retries
        if (isRetryableScanError(error)) {
            markApiDown();
        }

        throw error;
    }
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

            // Skip if API is currently down
            if (isApiDown) {
                console.warn(`[SCAN-ALTER] Skipping ${medias.length} image(s) - API is down`);
                return;
            }

            for (const media of medias) {
                try {
                    // Download buffer with retry logic
                    const buffer = await downloadAttachment(media.url);
                    
                    // Post scan with retry logic
                    const result = await postScan(buffer, media);

                    console.log(`[SCAN-ALTER] Clean:`, result.data?.data?.targetFound ? 'FLAGGED' : 'OK');

                    if (result.data?.data?.targetFound) {
                        // Delete message if suspicious
                        await message.delete().catch(err => 
                            console.error(`[SCAN-ALTER] Failed to delete message: ${err.message}`)
                        );
                    }
                } catch (error) {
                    // Log error but continue with other attachments
                    console.error(
                        `[SCAN-ALTER] Failed to scan attachment after ${MAX_SCAN_RETRIES + 1} attempts:`,
                        error.code || error.message
                    );
                }
            }
        } catch (error) {
            console.error('[SCAN-ALTER] Listener error:', error.message);
        }
    }
};