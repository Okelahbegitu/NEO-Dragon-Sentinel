const { MessageFlags, PermissionsBitField, EmbedBuilder } = require("discord.js");
const Member = require("../models/PermsAdminTroll");

module.exports = {
    name: "show_perms_admin_troll",
    description: "Menampilkan permissions yang dimiliki oleh admin untuk keperluan trolling",
    async execute(interaction) {

        const AdminData = await Member.find({ guildId: interaction.guildId });
        const field = AdminData ? AdminData.map((admin, indexedDB) => {
            return {
                name: `Admin ${indexedDB + 1}`,
                value: `<@${admin.usernameId}>`,
                inline: false,
            };
        }) : [{ name: "Tidak ada data", value: "Admin troll belum diatur untuk server ini.", inline: false }];

        const text = new EmbedBuilder()
            .setTitle("🔍 Permissions Admin Troll")
            .setDescription("Berikut adalah permissions yang dimiliki oleh admin untuk keperluan trolling:")
            .addFields(field)
            .setColor("#5865F2")
            .setFooter({ text: "Dragon Sentinel NEO" });



        if (!interaction.inGuild() || !interaction.guildId) {
            await interaction.reply({
                content: "Command ini hanya bisa digunakan di dalam server.",
                flags: MessageFlags.Ephemeral,
            });
            return;
        }
        return await interaction.reply({
            embeds: [text],
        });

        if (!interaction.memberPermissions?.has(PermissionsBitField.Flags.Administrator)) {
            await interaction.reply({
                content: "Kamu tidak punya izin untuk menggunakan perintah ini.",
                flags: MessageFlags.Ephemeral,
            });
            return;
        }
    }
};