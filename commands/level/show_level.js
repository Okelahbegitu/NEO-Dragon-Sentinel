const level = require('../../models/level_tb');
const { renderLevelCard } = require('../../function/rank_card_renderer');



module.exports = {
    name: "show_level",
    description: "Menampilkan level dan XP member",
    options: [
        {
            name: "user",
            description: "Member yang ingin ditampilkan levelnya",
            type: 6,
            required: false,
        },
    ],
    async execute(interaction) {
        const user_id =  interaction.options.getUser('user')?.id ?? interaction.user.id;
        const user_level_data = await level.findOne({ where: { username_id: user_id } });

        const username = interaction.options.getUser('user')?.username ?? interaction.user.username;
        let levelValue = 1;
        let xpValue = 0;
        let maxXp = 50;
        let progress = 0;

        if (!user_level_data) {
            await level.create({
                username_id: user_id,
                level: 1,
                xp: 0
            });
        } else {
            levelValue = user_level_data.level;
            xpValue = user_level_data.xp;
            maxXp = 50 * user_level_data.level ** 2;
            progress = Math.floor((user_level_data.xp / maxXp) * 100);

            console.log(user_level_data.xp, maxXp, progress)

        }

        const image = await renderLevelCard({
            username,
            level: levelValue,
            xp: xpValue,
            maxXp,
            progress,
        });


        const filePayload = { files: [{ attachment: await image, name: 'level_card.png' }] };

        if (interaction.deferred || interaction.replied) {
            await interaction.editReply(filePayload);
        } else {
            await interaction.reply(filePayload);
        }
    }
};