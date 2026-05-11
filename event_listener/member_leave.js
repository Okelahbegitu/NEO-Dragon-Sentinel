const { Events, EmbedBuilder } = require('discord.js');
const config = require('../models/config_tb');

module.exports = {
    name: Events.GuildMemberRemove,
    async execute(member) {
        const bye_channel_id = await config.findOne({ where: { key_name: "welcomebye_channel" } });
        if (!bye_channel_id) return;
        const bye_channel = member.guild.channels.cache.get(bye_channel_id.value);
        if (!bye_channel) return;
        const embed = new EmbedBuilder()
            .setTitle("Goodbye from Ender Sanctum!")
            .setDescription(`Selamat tinggal, <@${member.id}>!`)
            .setColor("#ff0000")
            .setAuthor({ name: member.user.tag, iconURL: member.user.displayAvatarURL() })
            .setThumbnail(member.user.displayAvatarURL())
            .setFooter({ text: "We hope to see you again!" });
        await bye_channel.send({ embeds: [embed] });
    }
}