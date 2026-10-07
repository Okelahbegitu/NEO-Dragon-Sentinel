import { ChannelType } from 'discord.js';
const achievementTable = require('../../models/user_achievements_tb');
export default {
    name: 'messageCreate',
    async execute(message) {
        if (message.author.bot) return;

        const { channel } = message;

        if (channel.isThread() && channel.type === ChannelType.GuildForum) {
            const creatorId = channel.ownerId;

            console.log(`Thread '${channel.name}' dibuat oleh ID: ${creatorId}`);
            console.log(`Username pembuat: ${creatorUser ? creatorUser.tag : 'Tidak ditemukan'}`);
            let totalMessages = 0;

            async function countUserMessages(thread) {
                
                let lastMessageId = null;
                while (true) {
                    let messagesList = await thread.messages.fetch({ limit: 100, before: lastMessageId });

                    //kalau kosong akhiri
                    if (messagesList.size === 0) break;

                    messagesList.forEach((msg) => {
                        if (msg.author.id !== creatorId) {
                            totalMessages++;
                            lastMessageId = msg.id;
                        }
                    });
                }
            }

            countUserMessages(channel).then(() => {
                console.log(`Total pesan dari pengguna lain di thread '${channel.name}': ${totalMessages}`);

                if (totalMessages >= 100) {
                    console.log(`Pencapaian "Bro, It's Not That Deep" tercapai oleh ID: ${creatorId}`);
                    achievementTable.findOrCreate({
                        where: {
                            username_id: creatorId,
                            achievement_id: 6
                        },
                        defaults: { 
                            username_id: creatorId,
                            achievement_id: 6
                        }
                    }).then(([achievement, created]) => {
                        if (created) {
                            console.log(`Pencapaian "Bro, It's Not That Deep" berhasil ditambahkan untuk ID: ${creatorId}`);
                        } else {
                            console.log(`Pencapaian "Bro, It's Not That Deep" sudah ada untuk ID: ${creatorId}`);
                        }
                    }).catch((error) => {
                        console.error(`Terjadi kesalahan saat menambahkan pencapaian untuk ID: ${creatorId}`, error);
                    })
                }
            })

        }
    }
}