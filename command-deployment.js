require('dotenv').config();
const fs = require("fs");
const path = require("path");
const { REST, Routes } = require('discord.js');

const commandsPath = path.join(__dirname, "commands");
const commandFiles = fs.readdirSync(commandsPath).filter((file) => file.endsWith(".js"));

const commands = commandFiles
    .map((file) => require(path.join(commandsPath, file)))
    .filter((command) => command.name && command.description)
    .map((command) => ({
        name: command.name,
        description: command.description,
        options: command.options || [],
    }));

const commandNameRegex = /^[a-z0-9_-]{1,32}$/;
const invalidCommands = commands.filter((cmd) => !commandNameRegex.test(cmd.name));

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
const clientId = process.env.CLIENT_ID;

(async () => {
    try {
        if (!clientId) {
            throw new Error('CLIENT_ID belum diisi di file .env');
        }

        if (invalidCommands.length > 0) {
            const invalidList = invalidCommands.map((cmd) => cmd.name).join(', ');
            throw new Error(`Nama command tidak valid: ${invalidList}. Gunakan huruf kecil, angka, '_' atau '-' (1-32 karakter).`);
        }

        console.log('Mendaftarkan global slash commands...');

        await rest.put(
            Routes.applicationCommands(clientId), // Global untuk semua server yang invite bot
            { body: commands }
        );

        console.log('Global commands berhasil didaftarkan!');
    } catch (error) {
        console.error(error);
    }
})();
