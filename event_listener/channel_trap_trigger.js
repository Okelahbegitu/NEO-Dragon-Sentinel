const { Events, PermissionsBitField, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const config = require("../models/config_tb");
const statistic = require("../models/statistic_tb");

const TRAP_CHANNEL_KEY = "trap_channel";
const TRAP_EMBEDDED_MESSAGE_KEY = "trap_embeded_message_id";

/**
 * Update the ban counter button label in the trap channel message
 */
async function updateBanCounterButton(trapChannel, messageId, newCount) {
    try {
        const message = await trapChannel.messages.fetch(messageId);
        
        // Create updated button with new count
        const updatedButton = new ButtonBuilder()
            .setCustomId('ban_counter')
            .setLabel(`Ban Counter: ${newCount}`)
            .setStyle(ButtonStyle.Secondary);

        // Create new action row with updated button
        const updatedRow = new ActionRowBuilder().addComponents(updatedButton);

        // Edit message with new button
        await message.edit({ components: [updatedRow] });
        console.log(`Ban counter updated to ${newCount} in trap channel message`);
    } catch (error) {
        console.error(`Error updating ban counter button:`, error);
    }
}

module.exports = {
    name: Events.MessageCreate,
    async execute(message) {
        if (message.author.bot) return;
        if (!message.guild) return;

        const user = message.author;
        const guildId = message.guildId;

        try {
            // Get trap channel config
            const trap = await config.findOne({
                where: { key_name: TRAP_CHANNEL_KEY }
            });

            // Check if this message is in the trap channel
            if (!trap || trap.value !== message.channelId) return;

            // Exclude administrators and the guild owner
            if (
                message.member?.permissions?.has(PermissionsBitField.Flags.Administrator) ||
                message.guild?.ownerId === user.id
            ) return;

            // Delete the trap message immediately
            await message.delete();

            // Ban user dengan alasan yang jelas
            await message.guild.members.ban(user.id, {
                reason: "Activity detected in trap channel - suspected compromised account/spam bot"
            });

            console.log(`User ${user.tag} has been banned for trap channel activity.`);

            // Update the ban counter in statistic_tb
            const [statisticRecord] = await statistic.findOrCreate({
                where: { name: 'ban_counter' },
                defaults: { value: '1' }
            });

            if (!statisticRecord.isNewRecord) {
                await statisticRecord.update({
                    value: (parseInt(statisticRecord.value) + 1).toString()
                });
            }

            const newCount = parseInt(statisticRecord.value) + 1;

            // Get trap channel object
            const trapChannel = await message.guild.channels.fetch(trap.value);

            // Get embedded message ID from database
            const embeddedMessageConfig = await config.findOne({
                where: { key_name: TRAP_EMBEDDED_MESSAGE_KEY }
            });

            if (embeddedMessageConfig && trapChannel) {
                await updateBanCounterButton(trapChannel, embeddedMessageConfig.value, newCount);
            }
        } catch (error) {
            console.error(`Error processing trap channel for ${user.tag}:`, error);
        }
    }
};