const { MessageFlags, PermissionsBitField, EmbedBuilder } = require("discord.js");
const Member = require("../../models/perms_admin_troll_tb");

module.exports = async function showAdminTroll(interaction) {
    if (!interaction.inGuild() || !interaction.guildId) {
        await interaction.reply({
            content: "Command ini hanya bisa digunakan di dalam server.",
            flags: MessageFlags.Ephemeral,
        });
        return;
    }

    const AdminData = await Member.findAll();
    const field = AdminData ? AdminData.map((admin, indexedDB) => {
        return {
            name: `Admin ${indexedDB + 1}`,
            value: `<@${admin.username_id}> (ID: ${admin.username_id})`,
            inline: false,
        };
    }) : [{ name: "Tidak ada data", value: "Admin troll belum diatur untuk server ini.", inline: false }];

    const text = new EmbedBuilder()
        .setTitle("🔍 Permissions Admin Troll")
        .setDescription("Berikut adalah permissions yang dimiliki oleh admin untuk keperluan trolling:")
        .addFields(field)
        .setColor("#5865F2")
        .setFooter({ text: "Dragon Sentinel NEO" });

    return await interaction.reply({
        embeds: [text],
    });
};
