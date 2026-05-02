module.exports = {
  name: "ping",
  description: "Balas Pong!",
  async execute(interaction) {
    await interaction.reply("Pong!");
  },
};
