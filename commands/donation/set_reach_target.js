const { PermissionsBitField } = require('discord.js');
const target_donation = require('../../models/target_donation');

module.exports = async function set_reach_target(interaction) {
    let targetId = null; //interaction.options.getString('target_id');

    if(targetId === null) {
        //update aja yang target terbaru yang statusnya unreached
        const target = await target_donation.findOne({ where: { status: 'unreached' }, order: [['created_at', 'DESC']] });
        if (!target) {
            await interaction.reply('No unreached target found.');
            return;
        }
        targetId = target.id;
    }
    const target = await target_donation.findByPk(targetId);
    if (!target) {
        await interaction.reply('Target not found.');
        return;
    }
    target.status = 'reached';
    await target.save();
    await interaction.reply(`Target marked as reached! ID: ${target.id}`);
}