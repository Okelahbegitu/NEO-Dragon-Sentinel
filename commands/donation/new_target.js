const { PermissionsBitField } = require('discord.js');
const target_donation = require('../../models/target_donation');
const  {generateUniqueId } = require('../../function/id_maker');

module.exports = async function new_target(interaction) {
    const name = interaction.options.getString('name');
    const description = interaction.options.getString('description');
    const goalAmount = interaction.options.getInteger('goal_amount');

    try {
            const newTarget = await target_donation.create({
                id: generateUniqueId(8, 'td'),
                name,
                description,
                goal_amount: goalAmount
            });
        await interaction.reply(`Target created successfully! ID: ${newTarget.id}`);
    } catch (error) {
        console.error('Error creating target:', error);
        await interaction.reply('There was an error creating the target.');
    }
}