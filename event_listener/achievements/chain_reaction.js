const { Events } = require('discord.js');
const tabel = require('../../models/user_achievements_tb');


// Achievement: Chain Reaction
// cara dapatiny adalah pesan di reply 5 kali oleh orang2 berbeda

module.exports = {
    name: Events.MessageCreate,
    async execute(message) {
        if (message.author.bot) return;

        let userId = message.author.id;
                if (message.author.bot) return;

        const channel = message.channel;


        if (!channel.isThread()) return;


        if (channel.parent?.type !== ChannelType.GuildForum) return;


        const messages = await channel.messages.fetch({
            limit: 100
        });

        //kalau misal di reply dua atau lebih tapi sama orang, tetap kehitung satu
        const replyCount = new Set(messages.map(msg => msg.author.id)).size;

        if (replyCount >= 5) {
            // Achievement unlocked
            await tabel.lookupOrCreate({
                user_id: userId,
                achievement_id: 3 // Ganti dengan ID achievement yang sesuai
            });
        }
    }
}