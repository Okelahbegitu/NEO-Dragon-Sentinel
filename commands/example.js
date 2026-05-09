const exampleSub1 = require("./example/sub1");
const exampleSub2 = require("./example/sub2");

module.exports = {
    name: "example",
    description: "Ini adalah contoh command dengan subcommand",
    options: [
        {
            name: "sub1",
            description: "Jalankan subcommand 1",
            type: 1,
        },
        {
            name: "sub2",
            description: "Jalankan subcommand 2",
            type: 1,
        },
    ],
    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();

        if (subcommand === "sub1") {
            return exampleSub1(interaction);
        }

        if (subcommand === "sub2") {
            return exampleSub2(interaction);
        }

        return interaction.reply({
            content: "Subcommand tidak dikenal.",
            ephemeral: true,
        });
    },
};
