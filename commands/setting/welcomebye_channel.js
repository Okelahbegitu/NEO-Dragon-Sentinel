const config = require('../../models/config_tb');
const { ChannelType } = require('discord.js');

module.exports = async function welcomebye_channel(interaction) {
    const channel = interaction.options.getChannel("channel");
    if (channel.type !== ChannelType.GuildText) {
        return interaction.reply({ content: "Silakan pilih channel teks untuk welcome dan goodbye.", ephemeral: true });
    }
    try {
        const isExist = await config.findOne({ where: { key_name: "welcomebye_channel" } });

        if (isExist) {
            await config.update(
                { value: channel.id },
                { where: { key_name: "welcomebye_channel" } }
            );
        } else {
            await config.create({
                key_name: "welcomebye_channel",
                value: channel.id
            });
        }

        return interaction.reply({ content: `Channel welcome dan goodbye berhasil diatur ke ${channel}.`, ephemeral: true });
    } catch (error) {
        console.error(error);
        return interaction.reply({ content: "Terjadi kesalahan saat mengatur channel.", ephemeral: true });
    }
}
