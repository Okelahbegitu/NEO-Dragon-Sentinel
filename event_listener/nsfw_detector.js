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

// Threshold deteksi NSFW per kelas
const THRESHOLDS = {
    Hentai: 0.95,
    Sexy: 0.85,
    Porn: 0.90
};

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
                const predictions = await scanImage(media, buffer);

                console.log(predictions);

                const detected = predictions.find(prediction =>
                    THRESHOLDS[prediction.className] !== undefined &&
                    prediction.probability > THRESHOLDS[prediction.className]
                );

                if (detected) {
                    await handleNSFW(message, media, buffer, detected);
                    return; // stop setelah ketemu 1 attachment NSFW
                }
            }
        } catch (error) {
            console.error(
                "Error checking NSFW content:",
                error.response?.data || error.message
            );
        }
    },

    scanImage,
    handleNSFW,
    requestStaffConfirmation
};

async function downloadAttachment(url) {
    const imageResponse = await axios.get(url, {
        responseType: "arraybuffer"
    });
    return Buffer.from(imageResponse.data);
}

async function scanImage(media, buffer) {
    const formData = new FormData();

    formData.append("image", buffer, {
        filename: media.name || "image.jpg",
        contentType: media.contentType
    });

    const response = await axios.post(
        `${env.API_URL}/scan`,
        formData,
        { headers: formData.getHeaders() }
    );

    return response.data.predictions;
}

async function handleNSFW(message, media, buffer, prediction) {
    const reason = `Mengirim konten NSFW (${prediction.className} ${(prediction.probability * 100).toFixed(2)}%)`;
    const fileName = media.name || "nsfw-proof.jpg";

    await message.delete().catch(console.error);

    await message.author.send({
        content:
            `Pesan kamu telah dihapus karena terdeteksi mengandung konten NSFW.\n` +
            `Alasan: ${reason}\n` +
            `Pesan mu dalam peninjauan staff dan akan dipulihkan jika ternyata bukan NSFW.`,
        files: [{ attachment: buffer, name: fileName }]
    }).catch(console.error);

    await requestStaffConfirmation(message, media, buffer, prediction);
}

async function requestStaffConfirmation(message, media, buffer, prediction) {
    const fileName = media.name || "nsfw-proof.jpg";
    const attachmentName = `SPOILER_${fileName}`;

    const embed = new EmbedBuilder()
        .setTitle("Konten NSFW Terdeteksi")
        .setDescription(
            `User ${message.author.tag} (${message.author.id}) ` +
            `mengirimkan gambar yang mungkin mengandung konten NSFW.`
        )
        .addFields(
            {
                name: "Kelas Prediksi",
                value: `**${prediction.className}**`,
                inline: true
            },
            {
                name: "Probabilitas",
                value: `${(prediction.probability * 100).toFixed(2)}%`,
                inline: true
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

    const channel = await message.guild.channels.fetch(reportChannelConfig.value);

    if (!channel?.send) {
        console.error("Report channel not found or not sendable");
        return;
    }

    const reviewMessage = await channel.send({
        embeds: [embed],
        components: [buttons],
        files: [{ attachment: buffer, name: attachmentName }]
    });

    const collector = reviewMessage.createMessageComponentCollector({
        filter: interaction =>
            interaction.customId === `confirm_nsfw_${message.id}` ||
            interaction.customId === `deny_nsfw_${message.id}`,
        time: 24 * 60 * 60 * 1000
    });

    collector.on("collect", async interaction => {
        const isConfirm = interaction.customId === `confirm_nsfw_${message.id}`;

        await interaction.update({
            content: isConfirm
                ? "Konten telah dikonfirmasi sebagai NSFW."
                : "Konten dikonfirmasi bukan NSFW.",
            embeds: [],
            components: []
        });

        if (isConfirm) {
            await warn.giveWarn({
                target: message.author,
                moderator: interaction.user.tag,
                reason: `Konten NSFW dikonfirmasi staff (${(prediction.probability * 100).toFixed(2)}%)`,
                message: message
            });
            return;
        }

        await message.channel.send({
            content: `${message.author}, pesan kamu telah dipulihkan karena bukan NSFW.`,
            files: [{ attachment: buffer, name: fileName }]
        });
    });
}