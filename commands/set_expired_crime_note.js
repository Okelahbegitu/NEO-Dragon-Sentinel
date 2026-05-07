const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField, ActionRowBuilder } = require("discord.js");
const CrimeNoteMember = require("../models/CrimeNoteMember");

module.exports = {
    name: "set_expired_crime_note",
    description: "Menandai catatan kriminal sebagai kadaluarsa",
    options: [
        {
            name: "member",
            description: "Pilih member yang catatan kriminalnya ingin ditandai sebagai kadaluarsa",
            type: 6,
            required: true,
        },
        {
            name: "id_note",
            description: "Masukkan ID catatan kriminal yang ingin ditandai sebagai kadaluarsa",
            type: 3,
            required: true,
        }
    ],
    async execute(interaction) {
        const targetMember = interaction.options.getMember("member");
        const idNote = interaction.options.getString("id_note");


        

        if(!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)){
            await interaction.reply({
                content: "Anda tidak memiliki izin untuk menggunakan perintah ini.",
                ephemeral: true,
            });
            return;
        }

        if(!targetMember){
            await interaction.reply({
                content: "Silakan pilih member yang valid.",
                ephemeral: true,
            });
            return;
        }
        
        if(!idNote){
            await interaction.reply({
                content: "Silakan masukkan ID catatan kriminal yang valid.",
                ephemeral: true,
            });
            return;
        }



        try{
            const data = await CrimeNoteMember.findOne({
                guildId: interaction.guildId,
                usernameId: targetMember.id,
            });

            if (!data) {
                await interaction.reply({
                    content: `Tidak ditemukan catatan kriminal untuk ${targetMember}.`,
                    ephemeral: true,
                });
                return;
            }
            const noteIndex = data.history.findIndex(note => note.id_note === idNote);
            if(noteIndex === -1){
                await interaction.reply({
                    content: `Tidak ditemukan catatan kriminal dengan ID ${idNote} untuk ${targetMember}.`,
                    ephemeral: true,
                });
                return;
            }
            data.history[noteIndex].status = "removed";
            await data.save();

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
            return;
        }
    }
}