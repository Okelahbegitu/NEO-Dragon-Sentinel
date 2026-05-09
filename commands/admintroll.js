const addAdminTroll = require("./admintroll/add");
const removeAdminTroll = require("./admintroll/remove");
const showAdminTroll = require("./admintroll/show");

module.exports = {
    name: "admintroll",
    description: "Kelola izin admin untuk keperluan trolling",
    options: [
        {
            name: "add",
            description: "Tambahkan izin admin untuk user",
            type: 1,
            options: [
                {
                    name: "user",
                    description: "Pilih user yang akan diberikan izin admin",
                    type: 6,
                    required: true,
                },
            ],
        },
        {
            name: "remove",
            description: "Hapus izin admin dari user",
            type: 1,
            options: [
                {
                    name: "user",
                    description: "Pilih user yang akan dihapus izin admin",
                    type: 6,
                    required: true,
                },
            ],
        },
        {
            name: "show",
            description: "Tampilkan daftar admin troll",
            type: 1,
        },
    ],
    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();

        if (subcommand === "add") {
            return addAdminTroll(interaction);
        }

        if (subcommand === "remove") {
            return removeAdminTroll(interaction);
        }

        if (subcommand === "show") {
            return showAdminTroll(interaction);
        }

        return interaction.reply({
            content: "Subcommand tidak dikenal.",
            ephemeral: true,
        });
    },
};
