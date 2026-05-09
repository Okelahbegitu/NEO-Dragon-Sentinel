const showCrimeNote = require("./crimenote/show");
const setExpiredCrimeNote = require("./crimenote/setexpired");

module.exports = {
    name: "crimenote",
    description: "Mengelola catatan kriminal member",
    options: [
        {
            name: "show",
            description: "Menampilkan catatan kriminal seorang member",
            type: 1,
            options: [
                {
                    name: "member",
                    description: "Pilih member yang ingin ditampilkan catatan kriminalnya",
                    type: 6,
                    required: true,
                },
            ],
        },
        {
            name: "setexpired",
            description: "Menandai catatan kriminal sebagai kadaluarsa",
            type: 1,
            options: [
                {
                    name: "member",
                    description: "Pilih member yang catatan kriminalnya ingin ditandai sebagai kadaluarsa",
                    type: 6,
                    required: true,
                },
                {
                    name: "idnote",
                    description: "Masukkan ID catatan kriminal yang ingin ditandai sebagai kadaluarsa",
                    type: 3,
                    required: true,
                },
            ],
        },
    ],
    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();

        if (subcommand === "show") {
            return showCrimeNote(interaction);
        }

        if (subcommand === "setexpired") {
            return setExpiredCrimeNote(interaction);
        }

        return interaction.reply({
            content: "Subcommand tidak dikenal.",
            ephemeral: true,
        });
    },
};