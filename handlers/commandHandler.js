const { Events, MessageFlags } = require("discord.js");
const {
  setCooldown,
  isOnCooldown,
  getCooldownRemaining,
} = require("../function/cold_down");
const config = require("../models/config_tb");

const DEFAULT_COMMAND_COOLDOWN = 3000;

function formatCooldownMessage(remainingMs) {
  const remainingSeconds = Math.ceil(remainingMs / 1000);
  return `Tunggu ${remainingSeconds} detik sebelum memakai command ini lagi.`;
}

module.exports = (client) => {
  client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    const cooldownDuration = Number.isInteger(command.cooldown)
      ? command.cooldown
      : DEFAULT_COMMAND_COOLDOWN;
    const userId = interaction.user.id;
    const commandName = interaction.commandName;

    if (cooldownDuration > 0 && isOnCooldown(userId, commandName)) {
      const remainingMs = getCooldownRemaining(userId, commandName);

      await interaction.reply({
        content: formatCooldownMessage(remainingMs),
        flags: MessageFlags.Ephemeral,
      });

      return;
    }

    try {
      await command.execute(interaction);
      if (cooldownDuration > 0) {
        setCooldown(userId, commandName, cooldownDuration);
      }
      //laporkan ke console
      console.log(`Command executed: ${interaction.commandName} by ${interaction.user.tag}`);
      // ambil id_channel_log dari database (cocokkan key_name yang dipakai saat disimpan)
      const log_channel = await config.findOne({ where: { key_name: 'channel_log', status: 'active' } });
      if (log_channel) {
        const logMessage = `Command executed: ${interaction.commandName} by ${interaction.user.tag}`;
        try {
          await client.channels.cache.get(log_channel.value)?.send(logMessage);
        } catch (err) {
          console.error('Gagal mengirim log ke channel:', err);
        }
      } else {
        console.debug('No log channel configured (key_name=channel_log)');
      }
    } catch (error) {
      console.error(`Error executing command ${interaction.commandName}:`, error);

      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({
          content: "Terjadi error saat menjalankan command.",
          flags: MessageFlags.Ephemeral,
        });
      } else {
        await interaction.reply({
          content: "Terjadi error saat menjalankan command.",
          flags: MessageFlags.Ephemeral,
        });
      }
    }
  });
};
