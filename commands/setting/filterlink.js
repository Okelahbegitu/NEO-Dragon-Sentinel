const config = require("../../models/config_tb");
const { PermissionsBitField } = require('discord.js');


module.exports = async function filterLink(interaction) {
    const channel = interaction.options.getChannel("channel");
    if (!interaction.inGuild() || !interaction.guildId) {
        await interaction.reply({ content: "Command ini hanya bisa digunakan di dalam server.", ephemeral: true });
        return;
    }
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
        await interaction.reply({
            content: "Anda tidak memiliki izin untuk menggunakan perintah ini.",
            ephemeral: true,
        });
        return;
    }
    //simpan di db
    const isChannelExist = await config.findOne({ where: { key_name: 'filter_channel' } });

    if(isChannelExist){
        await config.update(
            { value: channel.id },
            { where: { key_name: 'filter_channel' } }
        );
        console.log("Filter channel updated:", isChannelExist);

    if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
        await interaction.reply({
            content: "Anda tidak memiliki izin untuk menggunakan perintah ini.",
            ephemeral: true,
        });
        return;
    }

    } else {
        const newFilterChannel = await config.create({
            key_name: 'filter_channel',
            value: channel.id
        });
        console.log("Filter channel saved:", newFilterChannel); 
    }
    await interaction.reply(`Filter link telah di set berhasil dengan channel ${channel.name}`);
};
