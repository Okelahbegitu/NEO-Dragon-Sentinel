const { PermissionsBitField } = require("discord.js");
const config = require("../../models/config_tb");


module.exports = async function reportChannel(interaction) {
    const targetChannel = interaction.options.getChannel("target_channel");
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
        return interaction.reply({
            content: "Kamu tidak memiliki izin untuk menggunakan perintah ini.",
            ephemeral: true,
        });
    }
    try {
        await config.upsert({
            key_name: "report_channel",
            value: targetChannel.id
        });
        return interaction.reply({
            content: `Channel untuk laporan pelanggaran telah diatur ke ${targetChannel}.`,
            ephemeral: true,
        });
    } catch (error) {
        console.error(`Error updating report channel:`, error);
        return interaction.reply({
            content: "Terjadi kesalahan saat mengatur channel laporan.",
            ephemeral: true,
        });
    }
};