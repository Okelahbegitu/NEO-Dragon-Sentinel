const { PermissionsBitField } = require('discord.js');
const warn = require('../commands/warn');

const cache = new Map();
const whitelist_channels = new Set();
whitelist_channels.add('901086791451426886'); //JunkYard

module.exports = {
    name: 'messageCreate',

    async execute(message) {
        if (message.author.bot) return;
        if (!message.guild) return;
        if (whitelist_channels.has(message.channel.id)) return;

        const mentions  =  message.mentions.users.size +
        message.mentions.roles.size +
        (message.mentions.everyone ? 1 : 0);

        if (mentions >= 5) {
            console.log(`${message.author.tag} mass mention`);
            message.delete();
            await warn.giveWarn({
                target: message.member,
                reason: 'Mass Mentioning',
                moderator: message.author,
                guildId: message.guild.id,
            });
        }
    }
};