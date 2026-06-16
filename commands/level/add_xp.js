const { PermissionsBitField } = require("discord.js");
const add_xp = require("../../function/add_xp");
const level_tb = require("../../models/level_tb");

module.exports = {
    name: "add_xp",
    description: "Tambah XP untuk user tertentu",
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        try {
            if (!interaction.memberPermissions?.has(PermissionsBitField.Flags.Administrator)) {
                await interaction.editReply({
                    content: "Kamu tidak punya izin untuk menggunakan perintah ini.",
                });
                return;
            }

            const member = interaction.options.getMember("user");
            const gain_xp = interaction.options.getInteger("amount");

            if (!member) {
                await interaction.editReply({ content: "User tidak ditemukan." });
                return;
            }

            if (member.user.bot) {
                await interaction.editReply({ content: "Bot tidak bisa diberi XP." });
                return;
            }

            if (gain_xp === null) {
                await interaction.editReply({ content: "XP tidak valid." });
                return;
            }

            const result = await add_xp(member, gain_xp, interaction.client);
            const user_level_data = result?.user_level_data ?? await level_tb.findOne({ where: { username_id: member.id } });

            if (!user_level_data) {
                await interaction.editReply({ content: "Data user tidak ditemukan." });
                return;
            }

            const levelUpNotice = result?.leveledUp
                ? `\n🎉 ${member.user.username} naik ${result.levelUps} level ke level ${user_level_data.level}!`
                : "";

            console.log(`Admin added ${gain_xp} XP to user ${member.user.username}. Total XP: ${user_level_data.xp}, Level: ${user_level_data.level}`);
            await interaction.editReply({
                content: `✅ Berhasil menambahkan ${gain_xp} XP untuk ${member.user.username}. Total XP sekarang: ${user_level_data.xp}, Level: ${user_level_data.level}${levelUpNotice}`,
            });
        } catch (error) {
            console.error("Error occurred while adding experience:", error);
            if (interaction.deferred || interaction.replied) {
                await interaction.editReply({ content: "Terjadi kesalahan saat menambahkan XP." });
            } else {
                await interaction.reply({ content: "Terjadi kesalahan saat menambahkan XP.", ephemeral: true });
            }
        }
    }
}