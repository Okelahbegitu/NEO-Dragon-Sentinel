const level = require('../../models/level_tb');
const puppeteer = require('puppeteer');


module.exports = {
    name: "show_leaderboard",
    description: "Menampilkan leaderboard level member",
    options: [],
    async execute(interaction) {
        await interaction.deferReply();

        try {
            const browser = await puppeteer.launch();
            const page = await browser.newPage();
            const fs = require("fs");
            const path = require("path");

            let html_comp = await fs.promises.readFile(
                path.join(__dirname, "../../assets/leaderboard.html"),
                "utf8"
            );

            const user_level_data = await level.findAll({ order: [['level', 'DESC'], ['xp', 'DESC']], limit: 10 });

            for (let i = 0; i < 10; i++) {
                const user_data = user_level_data[i];

                if (!user_data) {
                    html_comp = html_comp
                        .replaceAll(`{username_${i + 1}}`, "-")
                        .replaceAll(`{level_${i + 1}}`, "0")
                        .replaceAll(`{user_avatar_url_${i + 1}}`, "https://via.placeholder.com/128");
                    continue;
                }

                const member = await interaction.guild.members.fetch(user_data.username_id).catch(() => null);
                const displayName = member?.displayName ?? member?.user?.globalName ?? member?.user?.username ?? "Unknown";
                const avatarUrl = member?.displayAvatarURL?.({ extension: "png", size: 128 }) ?? "https://via.placeholder.com/128";

                html_comp = html_comp
                    .replaceAll(`{username_${i + 1}}`, displayName)
                    .replaceAll(`{level_${i + 1}}`, String(user_data.level))
                    .replaceAll(`{user_avatar_url_${i + 1}}`, avatarUrl);
            }
            
            await page.setViewport({
                width: 1366,
                height: 768,
                deviceScaleFactor: 1,
            });

            await page.setContent(html_comp);

            const image = await page.screenshot({
                type: "png",
                fullPage: true,
            });

            await browser.close();

            await interaction.editReply({
                files: [{ attachment: await image, name: 'leaderboard.png' }],
            });
        } catch (error) {
            console.error("Error occurred while showing leaderboard:", error);
            await interaction.editReply({ content: "Gagal menampilkan leaderboard." });
        }
    }
};