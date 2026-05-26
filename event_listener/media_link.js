const lintMedia = require("../function/domain_replace");
const { Events, PermissionsBitField } = require("discord.js");


module.exports = {
    name: Events.MessageCreate,
    async execute(message) {
        if (message.author.bot) return;
        if (!message.guild) return;
        const user = message.author;
        const guildId = message.guildId;
        try {
            //kirim ulang di channel yang sama
            const mediaLink = lintMedia(message.content);
            if (!mediaLink) return;
            message.channel.send(`[Send by ${user.tag}](${mediaLink})`).catch(() => null);
        }
        catch (error) {
            console.error(`Error processing media link for ${user.tag}:`, error);
        }
    }
};