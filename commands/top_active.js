const tb = require('../models/top_chat');




const config_tb = require('../models/config_tb');
const { EmbedBuilder, AttachmentBuilder, RoleFlagsBitField, UserFlagsBitField } = require('discord.js');
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
    name: 'set_active_leaderboard',
    description: 'Menampilkan daftar user yang paling aktif chat di server.',
    async execute(interaction) {

        await interaction.deferReply();

        //cek apakah user memiliki role admin
        const member = await interaction.guild.members.fetch(interaction.user.id);
        if (!member.permissions.has('Administrator')) {
            return interaction.editReply({
                content: 'Kamu tidak memiliki izin untuk menggunakan perintah ini.',
                ephemeral: true
            });
        }

        let id_embeded = await config_tb.findOne({
            where: {
                key_name: 'active_leaderboard'
            }
        });

        






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
        const embeded_message = await interaction.editReply({
            embeds: [embed],
            files: [thumbnail],
        });


        await config_tb.upsert({
            key_name: 'active_chat_leaderboard_embeded_id',
            value: embeded_message.id,
        });

        await config_tb.upsert({
            key_name: 'active_chat_leaderboard_channel_id',
            value: interaction.channelId,
        });
    }


};