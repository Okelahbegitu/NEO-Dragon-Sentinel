const { MessageFlags, PermissionsBitField } = require("discord.js");
const Member = require("../models/Member");

module.exports = {
    name: "add_perms_admin_troll",
    description: "Menambahkan izin admin untuk user",
    options: [
        {
            name: "user",
            description: "Pilih user yang akan diberikan izin admin",
            type: 6,
            required: true,
        }
    ],

    async execute(interaction) {
        if (!interaction.inGuild() || !interaction.guildId) {
            await interaction.reply({
                content: "Command ini hanya bisa digunakan di dalam server.",
                flags: MessageFlags.Ephemeral,
            });
            return;
        }

        if (!interaction.memberPermissions?.has(PermissionsBitField.Flags.Administrator)) {
            await interaction.reply({
                content: "Kamu tidak punya izin untuk menggunakan perintah ini.",
                flags: MessageFlags.Ephemeral,
            });
            return;
        }
        const targetUser = interaction.options.getUser("user");
        if (!targetUser) {
            await interaction.reply({ content: "User target tidak ditemukan.", flags: MessageFlags.Ephemeral });
            return;
        }

        const targetMember = await interaction.guild?.members.fetch(targetUser.id).catch(() => null);
        if (!targetMember) {
            await interaction.reply({ content: "Member target tidak ditemukan di server ini.", flags: MessageFlags.Ephemeral });
            return;
        }
        try {
            const data= await Member.create({ guildId: interaction.guildId, usernameId: targetUser.id });
            console.log("Admin permissions added for user:", data);
            await interaction.reply(`Izin admin telah diberikan kepada ${targetUser.tag}.`);
        } catch (error) {
            console.error("Error adding admin permissions:", error);
            await interaction.reply({ content: "Terjadi kesalahan saat menambahkan izin admin.", flags: MessageFlags.Ephemeral });
        }
    }
};
