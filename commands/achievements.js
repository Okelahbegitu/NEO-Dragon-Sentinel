const show = require("./achievements/show_achievements");

module.exports = {
    name: "achievements",
    description: "Menampilkan daftar achievement kamu",
    options: [
        {
            name: "show",
            description: "Tampilkan daftar achievement",
            type: 1,
            options: [
                {
                    name: "user",
                    description: "user yang ingin ditampilkan",
                    type: 6,
                    required: false
                }
            ]
        },
    ],
    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();

        if (subcommand === "show") {
            await show(interaction);
            return;
        }

        await interaction.reply({
            content: "Subcommand achievement tidak dikenali.",
            ephemeral: true
        });
    }
};