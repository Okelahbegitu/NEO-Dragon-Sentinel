const config = require('../../models/config_tb');
module.exports = async function set_donation_notif_channel(interaction) {
    const channel = interaction.options.getChannel('channel');
    if (!channel) {
        await interaction.reply({ content: 'Channel tidak ditemukan.', ephemeral: true });
        return;
    }
    await config.upsert({ key_name: 'donation_notif_channel_id', value: channel.id });
    await interaction.reply({ content: `Channel notifikasi donasi telah diatur ke <#${channel.id}>.`, ephemeral: true });
}