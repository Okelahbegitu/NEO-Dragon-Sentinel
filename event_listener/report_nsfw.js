const requestStaffConfirmation = require("./nsfw_detector");
const {
    Events,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} = require("discord.js");

module.exports = {
    name: Events.MessageCreate,

    async execute(message) {
        if (!message.guild) return;

        // cek apakah pesany bertulis !report_nsfw
        if (message.content.toLowerCase() === "!report_nsfw") {
            const target_message = await message.fetchReference();
            const timestamp = Math.floor((Date.now() + 5 * 1000) / 1000);
            if (target_message.attachments.size === 0) {
                const warning_message = await message.reply(`Pesan yang dilaporkan tidak memiliki media yang dapat diperiksa. Pesan ini akan dihapus <t:${timestamp}:R>`).catch(console.error);
                //tunggu 5 detik lalu hapus pesan peringatan
                setTimeout(() => {
                    warning_message.delete().catch(console.error);
                }, 5000);
                return;
            }
            await requestStaffConfirmation.requestStaffConfirmation(target_message, target_message.attachments.first(), null, null, message.author.id);
            target_message.author.send("Pesan Anda telah dilaporkan kepada staf untuk ditinjau. Terima kasih telah membantu menjaga komunitas tetap aman.").catch(console.error);
            target_message.delete();

        }
    }
}