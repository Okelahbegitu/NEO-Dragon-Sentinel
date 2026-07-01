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

async function downloadAttachment(url) {
    const imageResponse = await axios.get(url, {
        responseType: "arraybuffer"
    });
    return Buffer.from(imageResponse.data);
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
                const form = new FormData();
                form.append("image", buffer, {
                    filename: media.name || "image.png",
                    contentType: media.contentType || "image/png"
                });

                const result = await axios.post(
                    `${env.API_URL}/scan-alter`,
                    form,
                    {
                        headers: form.getHeaders(),
                        maxBodyLength: Infinity,
                        maxContentLength: Infinity
                    }
                );
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