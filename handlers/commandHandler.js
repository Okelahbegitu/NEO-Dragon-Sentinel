const { Events, MessageFlags } = require("discord.js");

module.exports = (client) => {
  client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    try {
      await command.execute(interaction);
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
