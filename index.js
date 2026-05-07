const fs = require("fs");
const path = require("path");
const { Client, Collection, GatewayIntentBits, Events } = require("discord.js");
const connectDB = require("./config/db");
const registerCommandHandler = require("./handlers/commandHandler");
const registerEventHandler = require("./handlers/eventHandler");

require("dotenv").config({ path: path.join(__dirname, ".env") });


const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.commands = new Collection();

const commandsPath = path.join(__dirname, "commands");
const commandFiles = fs.readdirSync(commandsPath).filter((file) => file.endsWith(".js"));

for (const file of commandFiles) {
  const command = require(path.join(commandsPath, file));
  if (command.name && typeof command.execute === "function") {
    client.commands.set(command.name, command);
  }
}

client.once(Events.ClientReady, () => {
  console.log(`Bot aktif sebagai ${client.user.tag}`);
});

registerCommandHandler(client);
registerEventHandler(client);
(async () => {
  if (!process.env.DISCORD_TOKEN) {
    throw new Error('DISCORD_TOKEN is not set');
  }

  await connectDB();
  await client.login(process.env.DISCORD_TOKEN);
})();

module.exports = client;