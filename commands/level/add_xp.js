const { PermissionsBitField } = require("discord.js");
const add_xp = require("../../function/add_xp");
const level_tb = require("../../models/level_tb");

module.exports = {
    name: "add_xp",
    description: "Tambah XP untuk user tertentu",
    async execute(interaction) {
        try {
            if (!interaction.memberPermissions?.has(PermissionsBitField.Flags.Administrator)) {
                await interaction.reply({
                    content: "Kamu tidak punya izin untuk menggunakan perintah ini.",
                    ephemeral: true,
                });
                return;
            }

            const member = interaction.options.getMember("user");
            const gain_xp = interaction.options.getInteger("amount");

            if (!member) {
                await interaction.reply({ content: "User tidak ditemukan.", ephemeral: true });
                return;
            }

            if (member.user.bot) return;

            if (gain_xp === null) {
                await interaction.reply({ content: "XP tidak valid.", ephemeral: true });
                return;
            }

            const updatedUserData = await add_xp(member, gain_xp);
            const user_level_data = updatedUserData ?? await level_tb.findOne({ where: { username_id: member.id } });

            if (!user_level_data) {
                await interaction.reply({ content: "Data user tidak ditemukan.", ephemeral: true });
                return;
            }

            console.log(`Admin added ${gain_xp} XP to user ${member.user.username}. Total XP: ${user_level_data.xp}, Level: ${user_level_data.level}`);
            await interaction.reply({
                content: `✅ Berhasil menambahkan ${gain_xp} XP untuk ${member.user.username}. Total XP sekarang: ${user_level_data.xp}, Level: ${user_level_data.level}`,
                ephemeral: true,
            });
        } catch (error) {
            console.error("Error occurred while adding experience:", error);
            await interaction.reply({ content: "Terjadi kesalahan saat menambahkan XP.", ephemeral: true });
        }
    }
}