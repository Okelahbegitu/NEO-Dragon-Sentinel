const { Events, PermissionsBitField } = require("discord.js");
const config = require("../models/config_tb");

module.exports = {
    name: Events.MessageCreate,
    async execute(message) {
        if (message.author.bot) return;
        if (!message.guild) return;

        const user = message.author;
        const guildId = message.guildId;

        try {
            const trap = await  config.findOne({
                where: { key_name: 'trap_channel', status: 'active' }
            });

            if (!trap || trap.value !== message.channelId) return;
            // exclude administrators and the guild owner
            if (
                message.member?.permissions?.has(PermissionsBitField.Flags.Administrator) ||
                message.guild?.ownerId === user.id
            ) return;

            // Ban user dengan alasan yang jelas
            await message.guild.members.ban(user.id, { reason: "Melakukan mass-advertising di trap channel" });

            console.log(`User ${user.tag} has been banned for mass-advertising.`);

            // Feedback ke channel
            await message.channel.send(`🚫 ${user.tag} telah di-ban karena mass-advertising.`).catch(() => null);
        } catch (error) {
            console.error(`Error processing trap channel for ${user.tag}:`, error);
        }
    }
};