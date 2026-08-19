const cron = require("node-cron");
const { Op, where, fn, col, literal } = require("sequelize");
const config_tb = require("../models/config_tb");
const tb = require("../models/top_chat");
const client = require("../index");
const { EmbedBuilder, AttachmentBuilder } = require('discord.js');
const path = require('path');

const thumbnail = new AttachmentBuilder(
    path.join(__dirname, '..', 'assets', 'leader_board_active.png'),
    { name: 'leader_board_active.png' }
);


client.once('clientReady', () => {
    console.log('[SCHEDULER] Active leaderboard refresh started.');


    //setiap 1 detik untuk kebutuhan testing, nanti diganti ke setiap 1 menit
    cron.schedule(" */5 * * * *", async () => {
        try {
            const id_embeded = await config_tb.findOne({
                where: {
                    key_name: 'active_chat_leaderboard_embeded_id'
                }
            });

            //update embeded message
            const topUsers = await tb.findAll({
                order: [['amount', 'DESC']],
                limit: 10
            });

            //cek apakah embeded dan channel id sudah ada di database
            if (!id_embeded || !id_embeded.value) {
                console.log("[SCHEDULER] Active chat leaderboard embeded id not found in database. Skipping refresh.");
                return;
            }

            const emoji_numnber = ['🥇', '🥈', '🥉', '#4', '#5', '#6', '#7', '#8', '#9', '#10'];

            const channel_id = await config_tb.findOne({
                where: {
                    key_name: 'active_chat_leaderboard_channel_id'
                }
            });


            const embeded_id = await config_tb.findOne({
                where: {
                    key_name: 'active_chat_leaderboard_embeded_id'
                }
            });

            const channel = await client.channels.fetch(channel_id.value);
            const message = await channel.messages.fetch(embeded_id.value);


            const embed = new EmbedBuilder()
                .setTitle('Leaderboard')
                .setThumbnail('attachment://leader_board_active.png')
                .setDescription('**# 🏆 TOP 10 USER PALING AKTIF** \n Berikut adalah daftar user yang paling aktif chat di server ini:')
                .addFields(
                    topUsers.map((user, index) => ({
                        name: '',
                        value: `**${emoji_numnber[index]}** <@${user.id_user}> — \`${user.amount} chat\``,
                        inline: false
                    }))
                )
                .setFooter({
                    text: 'Akan direset setiap tanggal 1'
                })
                .setColor('#f13efe')
            const embeded_message = await message.edit({
                embeds: [embed],
                files: [thumbnail],
            });


            await message.edit({
                embeds: [embed],
                files: [thumbnail],
            });
            console.log("[SCHEDULER] Active chat leaderboard embed refreshed successfully.");
        } catch (err) {
            console.error("[SCHEDULER] Failed to refresh active chat leaderboard embed:", err.message);
        }
    });
})