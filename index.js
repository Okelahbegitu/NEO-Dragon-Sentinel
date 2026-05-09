const fs = require("fs");
const path = require("path");
const { Client, Collection, GatewayIntentBits, Events } = require("discord.js");
const env = require('./config/env');
const connectDB = require("./config/db");
const registerCommandHandler = require("./handlers/commandHandler");
const registerEventHandler = require("./handlers/eventHandler");

console.log('[BOT] Starting bot initialization...');

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
  try {
    await connectDB();
    console.log('[BOT] ✅ MongoDB connected');
  } catch (err) {
    console.error('[BOT] ❌ MongoDB connection failed');
  }

  try {
    if (!env.DISCORD_TOKEN) {
      throw new Error('DISCORD_TOKEN is not set');
    }
    console.log('[BOT] ✅ Discord token found, logging in...');
    await client.login(env.DISCORD_TOKEN);
  } catch (err) {
    console.error('[BOT] ❌ Discord login failed:', err.message);
    process.exit(1);
  }
})();

module.exports = client;