const { ChannelType, Events } = require("discord.js");
const achievementTable = require("../../models/user_achievements_tb");

const ACHIEVEMENT_ID = 5;
const REQUIRED_MESSAGES = 30;

async function countUserMessages(channel, userId, minimumMessages) {
    let totalMessages = 0;
    let before;

    while (totalMessages < minimumMessages) {
        const messages = await channel.messages.fetch({
            limit: 100,
            ...(before ? { before } : {})
        });

        if (messages.size === 0) break;

        totalMessages += messages.filter(({ author }) => author.id === userId).size;
        before = messages.last().id;

        if (messages.size < 100) break;
    }

    return totalMessages;
}

module.exports = {
    name: Events.MessageCreate,
    async execute(message) {
        if (message.author.bot) return;

        const { channel } = message;

        if (!channel.isThread() || channel.type !== ChannelType.PublicThread) return;

        const creatorId = channel.ownerId;
        if (!creatorId || !channel.messages) return;

        try {
            const totalMessages = await countUserMessages(
                channel,
                creatorId,
                REQUIRED_MESSAGES
            );

            if (totalMessages < REQUIRED_MESSAGES) return;

            const [, created] = await achievementTable.findOrCreate({
                where: {
                    username_id: creatorId,
                    achievement_id: ACHIEVEMENT_ID
                },
                defaults: {
                    username_id: creatorId,
                    achievement_id: ACHIEVEMENT_ID
                }
            });

            if (created) {
                console.log(`Pencapaian "Critical Mass" berhasil ditambahkan untuk ID: ${creatorId}`);
            }
        } catch (error) {
            console.error(
                `Gagal memproses pencapaian "Critical Mass" untuk thread ${channel.id}`,
                error
            );
        }
    }
};