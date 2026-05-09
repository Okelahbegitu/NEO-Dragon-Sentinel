module.exports = async function exampleSubcommand1(interaction) {
    try {
        await interaction.reply({
            content: 'Ini adalah subcommand 1 dari example command.',
            ephemeral: true
        });
    } catch (error) {
        console.error('Error in subcommand 1:', error);
        await interaction.reply({
            content: 'Terjadi kesalahan saat menjalankan subcommand 1.',
            ephemeral: true
        });
    }
};
