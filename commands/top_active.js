const tb = require('../models/top_chat');

const { EmbedBuilder } = require('discord.js');



const emnoji_numnber = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'];

module.exports = {
    name: 'top_active',
    description: 'Menampilkan daftar user yang paling aktif chat di server.',
    async execute(interaction) {

        await interaction.deferReply();

        const topUsers = await tb.findAll({
            order: [['amount', 'DESC']],
            limit: 10
        });

        const embed = new EmbedBuilder()
            .setTitle('Top 10 User Paling ~~Pengganguran~~ Aktif Chat')
            .setDescription('Berikut adalah daftar user yang paling aktif chat di server ini:')
            .addFields(
                topUsers.map((user, index) => ({
                    name: `${emnoji_numnber[index]}. #${index + 1}`,
                    value: `<@${user.id_user}> — **${user.amount} chat**`,
                    inline: false
                }))
            )
            .setFooter({
                text: 'Akan direset setiap tanggal 1 dan chat yang di channel tertentu tidak dihitung'
            })
            .setColor('#f13efe');

        await interaction.editReply({ embeds: [embed] });
    }
};