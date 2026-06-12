const level = require('../../models/level_tb');
const { prepareLeaderboardRows, renderLeaderboardCard } = require('../../function/rank_card_renderer');


module.exports = {
    name: "show_leaderboard",
    description: "Menampilkan leaderboard level member",
    options: [],
    async execute(interaction) {
        await interaction.deferReply();

        try {
            const user_level_data = await level.findAll({ order: [['level', 'DESC'], ['xp', 'DESC']], limit: 10 });
            const rows = await prepareLeaderboardRows(interaction, user_level_data);
            const image = await renderLeaderboardCard({
                rows,
            });

            await interaction.editReply({
                files: [{ attachment: await image, name: 'leaderboard.png' }],
            });
        } catch (error) {
            console.error("Error occurred while showing leaderboard:", error);
            await interaction.editReply({ content: "Gagal menampilkan leaderboard." });
        }
    }
};