const {
    EmbedBuilder,
    ActionRowBuilder

} = require("discord.js");

const target_donation = require('../models/target_donation');

const config = require("../models/config_tb");
const env = require("../config/env");

async function tacoDonation(taco_data, client) {
    

    const embed_target_donation = new EmbedBuilder()

    const target_donation_res = await target_donation.findOne({ where: { status: 'unreached' }, order: [['created_at', 'DESC']] });
    
    const embed = new EmbedBuilder()
        .setTitle(
            (taco_data.amount + target_donation_res.current_amount >= target_donation_res.goal_amount && target_donation_res) ? "🏆 Treasury Goal Reached" :
            (taco_data.amount >= 100000) ? "👑 Royal Tribute" : 
            (taco_data.amount >= 50000) ? "🔥 Grand Tribute" :
            (taco_data.amount >= 10000) ? "💎 Honored Tribute" :
            "⚜️ New Tribute"
        )
        .setDescription(`**Terima kasih atas dukungannya!**`)
        .addFields(
            { name: "👤 Donor", value: taco_data.gifterName || "Anonymous", inline: true },
            { name: "💰 Amount", value: `Rp ${taco_data.amount.toLocaleString()}`, inline: true },
            { name: "💬 Message", value: taco_data.message || "No message provided", inline: true }
        )      .setColor(
            (taco_data.amount + target_donation_res.current_amount >= target_donation_res.goal_amount && target_donation_res) ? "#FFE066" :
            (taco_data.amount >= 100000) ? "#2ECC71" :
            (taco_data.amount >= 50000) ? "#00BFFF" :
            (taco_data.amount >= 10000) ? "#FF8C00" :
            "#D4AF37"
        )
        .setImage(taco_data.gifUrl);
    
    const embeded_button = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setLabel("Donasi")
            .setStyle(ButtonStyle.Link)
            .setURL(`https://tako.id/LordEndo/gift`)
    );
    


    if (target_donation_res) {
        console.log(`Current amount before update: ${target_donation_res.current_amount}`);
        console.log(`Amount to add: ${taco_data.amount}`);
        console.log(`Current amount after update: ${target_donation_res.current_amount + taco_data.amount}`);
        const progress = Math.floor(((target_donation_res.current_amount + taco_data.amount) / target_donation_res.goal_amount) * 100);

        // 1. Batasi progress maksimal 100 dan minimal 0 supaya tidak bug
        const clampedProgress = Math.min(Math.max(progress, 0), 100);

        // 2. Hitung berapa jumlah kotak hijau (skala 1-10)
        const greenCount = Math.floor(clampedProgress / 10);

        let progress_bar = "";
        for (let i = 0; i < 10; i++) {
            // Jika indeks saat ini kurang dari jumlah kotak hijau, beri kotak hijau
            if (i < greenCount) {
                progress_bar += "🟩"; // Perhatikan: += untuk menambah ke kanan
            } else {
                progress_bar += "⬛";
            }
        }

        embed_target_donation.setTitle("🎯 Progress Donasi")
            .setDescription(`**${clampedProgress.toFixed(2)}% of target reached!**`)
            .setFooter({ text: target_donation_res.description })
            .addFields(
                { name: "🎯 Target Amount", value: `Rp ${target_donation_res.goal_amount.toLocaleString('id-ID')}`, inline: true },
                { name: "💰 Current Amount", value: `Rp ${target_donation_res.current_amount.toLocaleString('id-ID')}`, inline: true },
                { name: "📊 Progress", value: `${progress_bar} ${progress.toFixed(2)}%`, inline: false }
            )
            .setColor("#ed37fa");

    }


    const donation_channel = await config.findOne({ where: { key_name: "donation_notif_channel_id" } });

    //kirim embed ke channel yang sudah di set
    if (donation_channel) {
        await client.channels.fetch(donation_channel.value)
            .then(channel => channel.send({ embeds: [embed] }))
            .catch(console.error);
    
        if (target_donation_res) {
            await client.channels.fetch(donation_channel.value)
                .then(channel => channel.send({ embeds: [embed_target_donation] }))
                .catch(console.error);
        }

    } else {
        console.error("Donation channel ID not set in database");
    }
}

module.exports = tacoDonation;
