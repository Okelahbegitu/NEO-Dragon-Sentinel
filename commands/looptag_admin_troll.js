const {  MessageFlags, PermissionsBitField } = require("discord.js");
const Member = require("../models/perms_admin_troll_tb");


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

        //matiin dulu command ini sementara karena bisa bikin spam, ntar kita tambahin validasi biar ga sembarangan pake command ini
        await interaction.reply({ content: "Maaf, command ini sedang dinonaktifkan sementara untuk mencegah penyalahgunaan.", ephemeral: true });
        return;




        //kita validasi dulu udh punya izin apa belum
        const is_perms_admin_troll = await Member.findOne({ where: { username_id: interaction.user.id } });

        if (!is_perms_admin_troll || !interaction.memberPermissions?.has(PermissionsBitField.Flags.Administrator)) {
            await interaction.reply({ content: "Kamu tidak memiliki izin untuk menggunakan perintah ini.", ephemeral: true });
            return;
        }
        for (let i = 0; i < jumlahTag; i++) {
            await interaction.channel.send(`${targetUser} ${pesan}`);
        }
        await interaction.reply({ content: `Selesai melakukan tag sebanyak ${jumlahTag} kali untuk ${targetUser.tag}.`});
    }
}