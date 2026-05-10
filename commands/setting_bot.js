const filterLink = require("./setting/filterlink");
const setChannelLog = require("./setting/setchannellog");
const setupTrap = require("./setting/setuptrap");
const setCooldown = require("./setting/cooldown");
const { PermissionsBitField } = require('discord.js'); // ← tambah ini

module.exports = {
    name: "settingbot",
    description: "Mengatur pengaturan bot untuk server",
    options: [
        {
            name: "filterlink",
            description: "Atur channel untuk filter link",
            type: 1,
            options: [
                {
                    name: "channel",
                    description: "Pilih channel tempat link akan di pending",
                    type: 7,
                    required: true,
                },
            ],
        },
        {
            name: "setchannellog",
            description: "Atur channel log untuk aktivitas bot",
            type: 1,
            options: [
                {
                    name: "channel",
                    description: "Pilih channel yang akan dijadikan channel log",
                    type: 7,
                    required: true,
                },
            ],
        },
        {
            name: "setuptrap",
            description: "Atur channel jebakan untuk raid/mass-adveritement",
            type: 1,
            options: [
                {
                    name: "channel",
                    description: "Pilih channel yang akan dijadikan jebakan",
                    type: 7,
                    required: true,
                },
            ],
        },
        {
            name: "cooldown",
            description: "Atur cooldown untuk menggunakan perintah (Default: 3 detik)",
            type: 1,
            options: [
                {
                    name: "duration",
                    description: "Durasi cooldown dalam detik",
                    type: 4,
                    required: true,
                },
            ],
        }
    ],
    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();

        if (subcommand === "filterlink") {
            return filterLink(interaction);
        }

        if (subcommand === "setchannellog") {
            return setChannelLog(interaction);
        }

        if (subcommand === "setuptrap") {
            return setupTrap(interaction);
        }

            if (subcommand === "cooldown") {
            return setCooldown(interaction);
        }

        return interaction.reply({
            content: "Subcommand tidak dikenal.",
            ephemeral: true,
        });
    },
};
