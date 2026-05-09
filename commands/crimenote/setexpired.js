const { PermissionsBitField } = require("discord.js");
const CrimeNoteMember = require("../../models/crime_note_members_tb");

module.exports = async function setExpiredCrimeNote(interaction) {
    const targetMember = interaction.options.getMember("member");
    const idNote = interaction.options.getString("idnote");

    if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
        await interaction.reply({
            content: "Anda tidak memiliki izin untuk menggunakan perintah ini.",
            ephemeral: true,
        });
        return;
    }

    if (!targetMember) {
        await interaction.reply({
            content: "Silakan pilih member yang valid.",
            ephemeral: true,
        });
        return;
    }

    if (!idNote) {
        await interaction.reply({
            content: "Silakan masukkan ID catatan kriminal yang valid.",
            ephemeral: true,
        });
        return;
    }

    try {
        const affectedRows = await CrimeNoteMember.update(
            {
                status: "expired",
            },
            {
                where: {
                    id_note: idNote,
                    username_id: targetMember.id,
                },
            }
        );

        if (!affectedRows || affectedRows[0] === 0) {
            await interaction.reply({
                content: `Tidak ditemukan catatan kriminal untuk ${targetMember}.`,
                ephemeral: true,
            });
            return;
        }

        await interaction.reply({
            content: `Catatan kriminal dengan ID ${idNote} untuk ${targetMember} telah ditandai sebagai kadaluarsa.`,
            ephemeral: true,
        });
    } catch (err) {
        console.error(err);
        await interaction.reply({
            content: "Terjadi kesalahan saat mengambil data catatan kriminal.",
            ephemeral: true,
        });
    }
};
