const tb = require('../models/top_chat');

const { EmbedBuilder, AttachmentBuilder } = require('discord.js');
const path = require('path');

const thumbnail = new AttachmentBuilder(
    path.join(__dirname, '..', 'assets', 'leader_board_active.png'),
    { name: 'leader_board_active.png' }
);

const banner = new AttachmentBuilder(
    path.join(__dirname, '..', 'assets', 'banner.png'),
    { name: 'banner.png' }
);



const emnoji_numnber = ['🥇', '🥈', '🥉', '#4', '#5', '#6', '#7', '#8', '#9', '#10'];

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
            .setTitle('Leaderboard')
            .setThumbnail('attachment://leader_board_active.png')
            .setDescription('**# 🏆 TOP 10 USER PALING AKTIF** \n Berikut adalah daftar user yang paling aktif chat di server ini:')
            .addFields(
                topUsers.map((user, index) => ({
                    name: '',
                    value: `**${emnoji_numnber[index]}** <@${user.id_user}> — \`${user.amount} chat\``,
                    inline: false
                }))
            )
            .setFooter({
                text: 'Akan direset setiap tanggal 1'
            })
            .setColor('#f13efe')
        await interaction.editReply({
            embeds: [embed],
            files: [thumbnail],
        });
    }


};