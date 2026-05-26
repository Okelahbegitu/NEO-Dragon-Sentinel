const { Events } = require('discord.js');
const axios = require('axios');
const FormData = require("form-data");
const warn = require('../commands/warn');
const config = require('../models/config_tb');
const env = require('../config/env');

module.exports = {
    name: Events.MessageCreate,

    async execute(message) {

        if (!message.guild) return;

        try {

            const medias = [];

            message.attachments.forEach(attachment => {

                if (
                    attachment.contentType &&
                    attachment.contentType.startsWith('image/')
                ) {
                    medias.push(attachment);
                }
            });

            if (medias.length === 0) return;

            for (const media of medias) {

                // download image
                const imageResponse = await axios.get(media.url, {
                    responseType: "arraybuffer"
                });

                const buffer = Buffer.from(imageResponse.data);

                // buat form-data
                const formData = new FormData();

                formData.append("image", buffer, {
                    filename: media.name || "image.jpg",
                    contentType: media.contentType
                });

                // kirim ke API
                const response = await axios.post(
                    `${env.API_URL}/scan`,
                    formData,
                    {
                        headers: formData.getHeaders()
                    }
                );

                const predictions = response.data.predictions;
                for (const prediction of predictions) {
                    if (prediction.probability * 100 >= 75 && prediction.className !== 'Neutral' && prediction.className !== 'Drawing') {
                        await message.delete();
                        try {
                            await warn.giveWarn({
                                target: message.author,
                                reason: `Mengirim konten NSFW (${prediction.className} dengan probabilitas ${Math.round(prediction.probability * 100)}%)`
                            });
                            await message.author.delete().catch(console.error);

                            if (prediction.probability * 100 >= 90) {
                                //kick user
                                await message.member.kick(`Mengirim konten NSFW (${prediction.className} dengan probabilitas ${Math.round(prediction.probability * 100)}%)`).catch(console.error);
                            } else {
                                //timeout 1 hari
                                await message.member.timeout(24 * 60 * 60 * 1000, `Mengirim konten NSFW (${prediction.className} dengan probabilitas ${Math.round(prediction.probability * 100)}%)`).catch(console.error);
                            }
                        } catch (dmError) {
                            console.error(
                                `Gagal mengirim DM ke ${message.author.tag}:`,
                                dmError.message
                            );
                        }
                        break;
                    }
                }

                console.log(predictions);
            }

        } catch (error) {

            console.error(
                'Error checking NSFW content:',
                error.response?.data || error.message
            );
        }
    }
};