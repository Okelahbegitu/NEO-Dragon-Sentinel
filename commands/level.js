const { op } = require("@tensorflow/tfjs");

const show_level = require("./level/show_level");
const show_leaderboard = require("./level/show_leaderboard");
const add_xp = require("./level/add_xp");
const reset_xp = require("./level/reset_xp");

const level = require("../models/level_tb");
const { name } = require("./admintroll");


module.exports = {
    name: "level",
    description: "Perintah untuk menampilkan level dan XP member dan juga untuk menampilkan leaderboard",
    options: [
        {
            name: "show_level",
            description: "Menampilkan level dan XP member",
            type: 1,
            options: [
                {
                    name: "user",
                    description: "Pilih member yang ingin ditampilkan levelnya",
                    type: 6,
                    required: false,
                }
            ],
        },
        {
            name: "show_leaderboard",
            description: "Menampilkan leaderboard level member",
            type: 1,
            options: []
        },{
            name: "add_xp",
            description: "Tambah XP untuk user tertentu (Admin Only)",
            type: 1,
            options: [
                {
                    name: "user",
                    description: "Pilih member yang ingin ditambahkan XP-nya",
                    type: 6,
                    required: true,
                },
                {
                    name: "amount",
                    description: "Jumlah XP yang ingin ditambahkan",
                    type: 4,
                    required: true,
                }
            ]
        },{
            name: "reset_xp",
            description: "Reset XP untuk user tertentu (Admin Only)",
            type: 1,
            options: [
                {
                    name: "user",
                    description: "Pilih member yang ingin direset XP-nya",
                    type: 6,
                    required: true,
                }
            ]
        }
    ],
    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();

        if (subcommand === "show_level") {
            await show_level.execute(interaction);
        } else if (subcommand === "show_leaderboard") {
            await show_leaderboard.execute(interaction);
        } else if (subcommand === "add_xp") {
            await add_xp.execute(interaction);
        } else if (subcommand === "reset_xp") {
            await reset_xp.execute(interaction);
        } else {
            await interaction.reply({ content: "Subcommand tidak dikenali.", ephemeral: true });
        }
    }
};
