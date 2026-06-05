const target = require('../../models/target_donation');
const { EmbedBuilder } = require('discord.js');

module.exports = async function show_progress(interaction) {
    try {
        const currentTarget = await target.findOne({ where: { status: 'unreached' }, order: [['created_at', 'DESC']] });
        if (!currentTarget) {
            await interaction.reply({ content: 'Tidak ditemukan target yang belum tercapai.', ephemeral: true });
            return;
        }
        const progress = Math.floor((currentTarget.current_amount / currentTarget.goal_amount) * 100);

        // 1. Batasi progress maksimal 100 dan minimal 0 supaya tidak bug
        const clampedProgress = Math.min(Math.max(progress, 0), 100);

        // 2. Hitung berapa jumlah kotak hijau (skala 1-10)
        const greenCount = Math.floor(clampedProgress / 10);

        let progress_bar = "";
        for (let i = 0; i < 10; i++) {
            // Jika indeks saat ini kurang dari jumlah kotak hijau, beri kotak hijau
            if (i < greenCount) {
                progress_bar += "🟩"; // Perhatikan: += untuk menambah ke kanan
            } else {
                progress_bar += "⬛";
            }
        }

        const embed = new EmbedBuilder()
            .setTitle(`🎯 Progress Target Donasi: ${currentTarget.name}`)
            .setDescription(`**${progress.toFixed(2)}% of target reached!**`)
            .setFooter({ text: currentTarget.description })
            .addFields(
                { name: "🎯 Target Amount", value: `Rp ${currentTarget.goal_amount.toLocaleString('id-ID')}`, inline: true },
                { name: "💰 Current Amount", value: `Rp ${currentTarget.current_amount.toLocaleString('id-ID')}`, inline: true },
                { name: "📊 Progress", value: `${progress_bar} ${progress.toFixed(2)}%`, inline: false }
            )
            .setColor("#912597");
        await interaction.reply({ embeds: [embed] });
    } catch (error) {
        console.error('Error fetching target:', error);
        await interaction.reply({ content: 'Terjadi kesalahan saat mengambil target.', ephemeral: true });
    }
}