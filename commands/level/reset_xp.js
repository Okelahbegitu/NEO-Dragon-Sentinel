const { EmbedBuilder, ButtonBuilder, ActionRowBuilder, PermissionFlagsBits } = require("discord.js");
const level = require("../../models/level_tb");

module.exports = {
    name: "reset_xp",
    description: "Reset XP untuk user tertentu",
    async execute(interaction) {
        if (!interaction.memberPermissions?.has(PermissionFlagsBits.Administrator)) {
            await interaction.reply({ content: "Kamu tidak punya izin untuk menggunakan perintah ini.", ephemeral: true });
            return;
        }

        const targetUser = interaction.options.getUser("user");

        if (!targetUser) {
            await interaction.reply({ content: "User tidak ditemukan.", ephemeral: true });
            return;
        }

        if (targetUser.bot) {
            await interaction.reply({ content: "Bot tidak bisa direset XP-nya.", ephemeral: true });
            return;
        }

        const confirmEmbed = new EmbedBuilder()
            .setTitle("Konfirmasi Reset XP")
            .setDescription("Pikir 2 kali, apakah tindakan ini benar-benar diperlukan? XP akan direset ke 0 dan level akan direset ke 1. Tindakan ini tidak bisa dibatalkan.")
            .setColor(0x00ff00)
            .setFooter({ text: "Klik tombol konfirmasi untuk melanjutkan atau batal untuk membatalkan tindakan. expired dalam 60 detik" });

        const confirmButton = new ButtonBuilder()
            .setCustomId("confirm_reset")
            .setLabel("Konfirmasi ☠️")
            .setStyle("Danger");

        const cancelButton = new ButtonBuilder()
            .setCustomId("cancel_reset")
            .setLabel("Batal ❌")
            .setStyle("Secondary");

        const actionRow = new ActionRowBuilder().addComponents(confirmButton, cancelButton);

        await interaction.reply({ embeds: [confirmEmbed], components: [actionRow], ephemeral: true });

        const filter = (i) => i.user.id === interaction.user.id && (i.customId === "confirm_reset" || i.customId === "cancel_reset");
        const collector = interaction.channel.createMessageComponentCollector({ filter, time: 60000 });

        collector.on("collect", async (i) => {
            if (i.customId === "confirm_reset") {
                await level.update({ xp: 0, level: 1 }, { where: { username_id: targetUser.id } });
                await i.update({ content: `✅ XP untuk ${targetUser.username} telah direset.`, embeds: [], components: [] });
            } else if (i.customId === "cancel_reset") {
                await i.update({ content: "❌ Reset XP dibatalkan.", embeds: [], components: [] });
            }
        });
    }
};
