const { EmbedBuilder } = require("discord.js");
module.exports = {
    name: "help",
    description: "Menampilkan daftar perintah yang tersedia",
    async execute(interaction) {
        const embed = new EmbedBuilder()
            .setTitle("📖 Help - Dragon Sentinel")
            .setDescription("Daftar perintah yang tersedia:")
            .addFields(
                { name: "⚡ Umum", value: "`/ping` - Cek bot\n`/help` - Lihat command" },
                { name: "🛡️ Moderasi", value: "`/warn` - Memberi peringatan" },
                { name: "👑 Admin", value: "`/add_perms_admin_troll` - Tambah admin troll" }
            )
            .setColor("#5865F2")
            .setFooter({ text: "Dragon Sentinel NEO" });

        await interaction.reply({ embeds: [embed] });
    },
};