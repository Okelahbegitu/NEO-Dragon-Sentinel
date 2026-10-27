const { ChannelType, Events } = require('discord.js');
const tabel = require('../../models/user_achievements_tb');

const ACHIEVEMENT_ID = 3;

// Achievement: Chain Reaction
// cara dapatiny adalah pesan di reply 5 kali oleh orang2 berbeda

module.exports = {
    name: Events.MessageCreate,
    async execute(message) {
        if (message.author.bot) return;

        const userId = message.author.id;

        const channel = message.channel;


        if (!channel.isThread()) return;


        if (channel.parent?.type !== ChannelType.GuildForum) return;


        const messages = await channel.messages.fetch({
            limit: 100
        });

        //kalau misal di reply dua atau lebih tapi sama orang, tetap kehitung satu
        const replyCount = new Set(messages.map(msg => msg.author.id)).size;

        if (replyCount >= 5) {
            try {
                const [, created] = await tabel.findOrCreate({
                    where: {
                        username_id: userId,
                        achievement_id: ACHIEVEMENT_ID
                    },
                    defaults: {
                        username_id: userId,
                        achievement_id: ACHIEVEMENT_ID
                    }
                });

                if (created) {
                    console.log(`Chain Reaction achievement added for user ${userId}`);
                }
            } catch (error) {
                const isDuplicate = error.name === 'SequelizeUniqueConstraintError'
                    || error.original?.code === 'ER_DUP_ENTRY';

                if (isDuplicate) {
                    console.warn(
                        `Chain Reaction achievement was already added for user ${userId}`
                    );
                    return;
                }

                console.error(
                    `Failed to add Chain Reaction achievement for user ${userId}`,
                    error
                );
            }
        }
    }
}