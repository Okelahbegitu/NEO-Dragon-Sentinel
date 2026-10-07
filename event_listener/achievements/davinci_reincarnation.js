const { Events } = require('discord.js');
const tabel = require('../../models/user_achievements_tb');


module.exports = {
    name: Events.MessageReactionAdd,

    async execute(reaction, user) {
        console.log('🔥 REACTION TERPICU');

        if (reaction.partial) {
            try {
                await reaction.fetch();
            } catch (error) {
                console.error('Gagal mengambil data reaction:', error);
                return;
            }
        }

        const reactor = user;
        const message = reaction.message;
        const author = message.author;
        const channel = message.channel;

        if (reactor.bot) return;
        if (!author || reactor.id === author.id) return;

        console.log(
            `${reactor.username} react ${reaction.emoji.name} pada ${message.id}`
        );

        if (reaction.emoji.id == '1481053640977420288') {
            const reactionUsers = await reaction.users.fetch();

            if (reactionUsers.size >= 15) {
                console.log(`${reactor.username} sudah mencapai batas 15 user yang bisa di add ke list`);

                try {
                    const [achievement, created] = await tabel.findOrCreate({
                        where: {
                            username_id: author.id,
                            achievement_id: 2
                        },
                        defaults: {
                            username_id: author.id,
                            achievement_id: 2
                        }
                    });

                    if (created) {
                        console.log('Achievement berhasil ditambahkan ke database');
                    } else {
                        console.log('Achievement sudah ada di database');
                    }
                } catch (error) {
                    console.error('Gagal menambahkan achievement ke database:', error);
                }
            }
        }
    }
};