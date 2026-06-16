const { Events } = require("discord.js");
const add_xp = require("../function/add_xp");
const blacklist_channel = ["901086791451426886", "901078702476103791", "901079318195753010", "1144097480804417556"]

module.exports = {
    name: Events.MessageCreate,
    async execute(message) {
        if (message.author.bot) return;
        if (!message.guild) return;

        const user = message.author;

        try {
            //cek apakah kalimat lebih dari 5 kata
            if (message.content.trim().length < 5) return;

            if (blacklist_channel.includes(message.channel.id)) {
                return;
            }

            let y = Math.floor(
                message.content.split(" ").length / 5
            );

            let gain_xp = Math.floor((Math.random() * 10) + 15) + y;


            const roles = message.member.roles.cache;

            if (roles.has("1467492511890014339")) {
                gain_xp *= 3.5;
            } else if (
                roles.has("1032920319113052161") ||
                roles.has("1467477490573508679")
            ) {
                gain_xp *= 2;
            }

            await add_xp(message.member, gain_xp, message.client);


            console.log(`User ${user.username} gained ${gain_xp} XP.`);

        } catch (error) {
            console.error("Error occurred while gaining experience:", error);
        }
    }
};