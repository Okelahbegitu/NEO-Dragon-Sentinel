const {
    Events,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} = require("discord.js");

const axios = require("axios");
const FormData = require("form-data");
const config = require("../models/config_tb");

const warn = require("../commands/warn");
const env = require("../config/env");

module.exports = {
    name: Events.MessageCreate,

    async execute(message) {
        if (!message.guild) return;
        // Cek apakah pesan memiliki attachment dan bukan dari bot 
        if (message.author.bot) return;

        try {
            const medias = [...message.attachments.values()].filter(
                attachment =>
                    attachment.contentType?.startsWith("image/")
            );

            if (!medias.length) return;

            for (const media of medias) {
                const predictions = await scanImage(media);

                console.log(predictions);

                for (const prediction of predictions) {
                    const probability = Math.round(
                        prediction.probability * 100
                    );

                    const isNSFW =
                        probability >= 50 &&
                        prediction.className !== "Neutral" &&
                        prediction.className !== "Drawing";

                    if (!isNSFW) continue;

                    await handleNSFW(
                        message,
                        media,
                        prediction,
                        probability
                    );

                    return;
                }
            }
        } catch (error) {
            console.error(
                "Error checking NSFW content:",
                error.response?.data || error.message
            );
        }
    }
};

async function scanImage(media) {
    const imageResponse = await axios.get(media.url, {
        responseType: "arraybuffer"
    });

    const formData = new FormData();

    formData.append(
        "image",
        Buffer.from(imageResponse.data),
        {
            filename: media.name || "image.jpg",
            contentType: media.contentType
        }
    );

    const response = await axios.post(
        `${env.API_URL}/scan`,
        formData,
        {
            headers: formData.getHeaders()
        }
    );

    return response.data.predictions;
}

async function handleNSFW(
    message,
    media,
    prediction,
    probability
) {
    const reason =
        `Mengirim konten NSFW (${prediction.className} ` +
        `dengan probabilitas ${probability}%)`;
    await message.delete().catch(console.error);

    message.author.send({
        content:
            `Pesan kamu telah dihapus karena terdeteksi ` +
            `mengandung konten NSFW.\nAlasan: ${reason} ` +
            `Pesan mu dalam peninjauan staff dan akan dipulihkan jika ternyata ` +
            `bukan NSFW.`,
        files: [media.url]
    }).catch(console.error);

    if (probability >= 90) {
        await message.member
            .kick(reason)
            .catch(console.error);
    } else if (probability >= 80) {
        await message.member
            .timeout(
                24 * 60 * 60 * 1000,
                reason
            )
            .catch(console.error);
        warn.giveWarn({
            target: message.author,
            moderator: "AutoMod",
            reason
        });
    } else if (probability >= 65) {
        await requestStaffConfirmation(
            message,
            media,
            prediction,
            probability
        );
    }
}

async function requestStaffConfirmation(
    message,
    media,
    prediction,
    probability
) {
    const attachmentName = `SPOILER_${media.name || "nsfw-proof.jpg"}`;

    const embed = new EmbedBuilder()
        .setTitle("Konten NSFW Terdeteksi")
        .setDescription(
            `User ${message.author.tag} (${message.author.id}) ` +
            `mengirimkan gambar yang mungkin mengandung konten NSFW.`
        )
        .addFields(
            {
                name: "Kelas Prediksi",
                value: prediction.className
            },
            {
                name: "Probabilitas",
                value: `${probability}%`
            }
        )
        .setThumbnail(`attachment://${attachmentName}`)
        .setImage(`attachment://${attachmentName}`)
        .setColor("Red")
        .setTimestamp();

    const buttons = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId(`confirm_nsfw_${message.id}`)
            .setLabel("Konfirmasi")
            .setStyle(ButtonStyle.Success),

        new ButtonBuilder()
            .setCustomId(`deny_nsfw_${message.id}`)
            .setLabel("Tolak")
            .setStyle(ButtonStyle.Danger)
    );

    const reportChannelConfig = await config.findOne({
        where: { key_name: "report_channel" }
    });

    if (!reportChannelConfig?.value) {
        console.error("report_channel belum diset di database");
        return;
    }

    const channel = await message.guild.channels.fetch(
        reportChannelConfig.value
    );

    if (!channel?.send) {
        console.error("Report channel not found or not sendable");
        return;
    }

    const reviewMessage = await channel.send({
        embeds: [embed],
        components: [buttons],
        files: [
            {
                attachment: media.url,
                name: attachmentName
            }
        ]
    });

    const collector =
        reviewMessage.createMessageComponentCollector({
            filter: interaction =>
                interaction.customId ===
                `confirm_nsfw_${message.id}` ||
                interaction.customId ===
                `deny_nsfw_${message.id}`,

            time: 24 * 60 * 60 * 1000
        });

    collector.on("collect", async interaction => {
        if (
            interaction.customId ===
            `confirm_nsfw_${message.id}`
        ) {
            await interaction.update({
                content:
                    "Konten telah dikonfirmasi sebagai NSFW.",
                embeds: [],
                components: []
            });

            await warn.giveWarn({
                target: message.author,
                moderator: interaction.user.tag,
                reason:
                    `Konten NSFW dikonfirmasi staff ` +
                    `(${prediction.className} - ${probability}%)`
            });

            return;
        }

        await interaction.update({
            content:
                "Konten dikonfirmasi bukan NSFW.",
            embeds: [],
            components: []
        });

        await message.channel.send({
            content:
                `${message.author}, pesan kamu ` +
                `telah dipulihkan karena bukan NSFW.`,
            files: [media.url]
        });
    });
}