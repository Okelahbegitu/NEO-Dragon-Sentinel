const { PermissionsBitField } = require('discord.js');
const target_donation = require('../../models/target_donation');

module.exports = async function add_amount_target(interaction) {
    let targetId = null; //interaction.options.getString('target_id');
    const amountToAdd = interaction.options.getInteger('amount');




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
    target.current_amount += amountToAdd;
    await target.save();
    await interaction.reply({ content: `Berhasil menambahkan ${amountToAdd} ke target! ID: ${target.id}, Current Amount: ${target.current_amount}`, ephemeral: true });
}
