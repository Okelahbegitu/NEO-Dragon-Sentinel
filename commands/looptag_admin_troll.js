const {  MessageFlags, PermissionsBitField } = require("discord.js");
const Member = require("../models/PermsAdminTroll");


module.exports = {
    name: "looptag",
    description: "Ngetag orang brutal (Harus ada izin admin troll)",
    options: [
        {
            name: "target",
            description: "Pilih target yang ingin kamu tag",
            type: 6,
            required: true,
        },
        {
            name: "jumlah",            
            description: "Jumlah tag yang ingin dilakukan (max 10)",
            type: 4,
            required: true,
        },
        {
            name: "pesan",
            description: "Pesan yang ingin dikirimkan bersama tag",
            type: 3,
            required: false,
        }
    ],
    async execute(interaction) {
        const targetUser = interaction.options.getUser("target");
        const jumlahTag = interaction.options.getInteger("jumlah");
        const pesan = interaction.options.getString("pesan") || "";
        for (let i = 0; i < jumlahTag; i++) {
            await interaction.channel.send(`${targetUser} ${pesan}`);
        }
        await interaction.reply({ content: `Selesai melakukan tag sebanyak ${jumlahTag} kali untuk ${targetUser.tag}.`});
    }
}