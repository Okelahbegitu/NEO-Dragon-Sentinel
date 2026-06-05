const target_donation = require("../../models/target_donation");

module.exports = async function change_target(interaction) {

    const new_goal_amount = interaction.options.getInteger('new_goal_amount') || null;
    const new_description = interaction.options.getString('new_description') || null;
    const new_name = interaction.options.getString('new_name') || null;

    try {
        const target = await target_donation.findOne({ where: { status: 'unreached' }, order: [['created_at', 'DESC']] });
        if (!target) {
            await interaction.reply({ content: 'Tidak ditemukan target yang belum tercapai.', ephemeral: true });
            return;
        }

        //kalau nilanya kososng, jangan update
        if (new_goal_amount !== null) {
            target.goal_amount = new_goal_amount;
        }
        if (new_description !== null) {
            target.description = new_description;
        }
        if (new_name !== null) {
            target.name = new_name;
        }
        await target.save();
        await interaction.reply({ content: `Target berhasil diperbarui! ID: ${target.id}`, ephemeral: true });
    } catch (error) {
        console.error('Error fetching target:', error);
        await interaction.reply({ content: 'Terjadi kesalahan saat mengambil target.', ephemeral: true });
        return;
    }
}