module.exports = async function exampleSubcommand2(interaction) {
    try {
        await interaction.reply({
            content: 'Ini adalah subcommand 2 dari example command.',
            ephemeral: true
        });
    } catch (error) {
        console.error('Error in subcommand 2:', error);
        await interaction.reply({
            content: 'Terjadi kesalahan saat menjalankan subcommand 2.',
            ephemeral: true
        });
    }
};
