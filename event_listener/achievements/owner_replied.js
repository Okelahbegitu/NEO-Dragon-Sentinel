const { Events } = require("discord.js");
const achievementTable = require("../../models/user_achievements_tb");
const ownerId = require("../../config/env").OWNER_ID;
const ACHIEVEMENT_ID = 12;

module.exports = {
    name: Events.MessageCreate,
    async execute(message) {
        if (message.author.bot) return;

        const referencedMessageId = message.reference?.messageId;
        if (!referencedMessageId) return;

        try {
            const repliedMessage = await message.channel.messages.fetch(referencedMessageId);
            if (repliedMessage.author.id !== ownerId) return;

            const [, created] = await achievementTable.findOrCreate({
                where: {
                    username_id: message.author.id,
                    achievement_id: ACHIEVEMENT_ID
                },
                defaults: {
                    username_id: message.author.id,
                    achievement_id: ACHIEVEMENT_ID
                }
            });

            console.log(
                created
                    ? `Pencapaian "Owner Replied" berhasil ditambahkan untuk ID: ${message.author.id}`
                    : `Pencapaian "Owner Replied" sudah ada untuk ID: ${message.author.id}`
            );
        } catch (error) {
            console.error("Terjadi kesalahan saat memeriksa pesan yang dibalas:", error);
        }
    }
};


