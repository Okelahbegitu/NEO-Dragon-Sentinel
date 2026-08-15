const { Events } = require("discord.js");
const sequelize = require('../database');

const tb = require('../models/top_chat');

const blacklist_channel = ["901086791451426886", "901078702476103791", "901079318195753010", "1144097480804417556"]

module.exports = {
    name: Events.MessageCreate,
    async execute(message) {
        if (message.author.bot) return;
        if (!message.guild) return;

        const user = message.author;

        try {
            //cek apakah chat di channel bukan black list
            if (blacklist_channel.includes(message.channel.id)) {
                return;
            }

            const [row, created] = await tb.findOrCreate({
                where: {
                    id_user: user.id
                },
                defaults: {
                    amount: 1
                }
            });

            if (!created) {
                await row.increment('amount', { by: 1 });
            }


            console.log(`User ${user.username} sent a message. and his chat count has been updated.`);
        } catch (error) {
            console.error("Error occurred while gaining experience:", error);
        }
    }
};