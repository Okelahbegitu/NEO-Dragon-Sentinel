const { PermissionsBitField } = require("discord.js");
const config = require("../../models/config_tb");

module.exports = async function setChannelLog(interaction) {
    const targetChannel = interaction.options.getChannel("channel");
    
    if (!interaction.inGuild() || !interaction.guildId) {
        await interaction.reply({
            content: "Command ini hanya bisa digunakan di dalam server.",
            ephemeral: true,
        });
        return;
    }
    
    const isAdmin = interaction.memberPermissions?.has(PermissionsBitField.Flags.Administrator);

    if (!isAdmin) {
        await interaction.reply({
            content: "Kamu tidak punya izin untuk menggunakan perintah ini.",
            ephemeral: true,
        });
        return;
    }
    
    const isChannelExist = await config.findOne({ where: { key_name: "channel_log", status: "active" } });

    if (isChannelExist) {
        await config.update(
            { value: targetChannel.id },
            { where: { key_name: "channel_log" } }
        );
        console.log("Channel log updated:", isChannelExist);
        await interaction.reply(`Channel ${targetChannel} telah berhasil diperbarui sebagai channel log.`);
    } else {
        await config.create({
            key_name: "channel_log",
            value: targetChannel.id
        });
        console.log("Channel log saved:", targetChannel.id);
        await interaction.reply(`Channel ${targetChannel} telah berhasil dijadikan channel log.`);
    }
};
