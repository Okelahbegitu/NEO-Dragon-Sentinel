const level = require('../../models/level_tb');
const puppeteer = require('puppeteer');



module.exports = {
    name: "show_level",
    description: "Menampilkan level dan XP member",
    options: [],
    async execute(interaction) {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        const fs = require("fs");

        const path = require("path");

        let html_card = await fs.promises.readFile(
            path.join(__dirname, "../../assets/level_card.html"),
            "utf8"
        );


        const user_id =  interaction.options.getUser('user')?.id ?? interaction.user.id;
        const user_level_data = await level.findOne({ where: { username_id: user_id } });



        if (!user_level_data) {
            await level.create({
                username_id: user_id,
                level: 1,
                xp: 0
            });
            html_card = html_card.replace('{USERNAME}', interaction.options.getUser('user')?.username ?? interaction.user.username)
                .replace('{LEVEL}', 1)
                .replace('{XP}', 0)
                .replaceAll('{PROGRESS}', 0)
                .replace('{MAX_XP}', 50)
        } else {

            const maxs_xp = 50 * user_level_data.level ** 2;
            const proggress = Math.floor((user_level_data.xp / maxs_xp) * 100);
            html_card = html_card.replace('{USERNAME}', interaction.options.getUser('user')?.username ?? interaction.user.username)
                .replace('{LEVEL}', user_level_data.level)
                .replace('{XP}', user_level_data.xp)
                .replaceAll('{PROGRESS}', proggress)
                .replace('{MAX_XP}', maxs_xp)

            console.log(user_level_data.xp, maxs_xp, proggress)

        }
        await page.setContent(html_card)
        const card = await page.$("#bg_card");

        const image = await card.screenshot({
            type: "png",
        });


        await interaction.reply({
            files: [{ attachment: await image, name: 'level_card.png' }],
        });
    }
};