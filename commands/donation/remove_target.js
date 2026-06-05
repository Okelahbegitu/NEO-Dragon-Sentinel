const { PermissionsBitField } = require('discord.js');
const {} = require('discord.js');
const config = require("../../models/config_tb");
const target_donation = require('../../models/target_donation');

module.exports = async function remove_target(interaction) {
    let targetId = null; //interaction.options.getString('target_id');

    if(targetId === null) {
        //update aja yang target terbaru yang statusnya unreached
        const target = await target_donation.findOne({ where: { status: 'unreached' }, order: [['created_at', 'DESC']] });
        if (!target) {
            await interaction.reply({ content: 'Tidak ditemukan target yang belum tercapai.', ephemeral: true });
            return;
        }
        targetId = target.id;
    }

    const target = await target_donation.findByPk(targetId);
    if (!target) {
        await interaction.reply({ content: "Target tidak ditemukan.", ephemeral: true });
        return;
    }

    target.status = 'removed';
    await target.save();
    await interaction.reply({ content: `Target berhasil dihapus! ID: ${target.id}`, ephemeral: true });
}