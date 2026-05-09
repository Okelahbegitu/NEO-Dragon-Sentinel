const fs = require("fs");
const path = require("path");
const { Client, Collection, GatewayIntentBits, Events } = require("discord.js");
const env = require('./config/env');
const connectDB = require("./config/db");
const registerCommandHandler = require("./handlers/commandHandler");
const registerEventHandler = require("./handlers/eventHandler");

env.validate();


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
  await connectDB();
  await client.login(env.DISCORD_TOKEN);
})();

module.exports = client;