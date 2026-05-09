const { PermissionsBitField } = require("discord.js");
const config = require("../../models/config_tb");

module.exports = async function setCooldown(interaction) {
    const cooldown = interaction.options.getInteger("duration");

    if (cooldown === null) {
        await interaction.reply({ content: "Silakan masukkan nilai cooldown dalam detik.", ephemeral: true });
        return;
    }

    if (!Number.isInteger(cooldown)) {
        await interaction.reply({ content: "Nilai cooldown harus berupa bilangan bulat (detik).", ephemeral: true });
        return;
    }

    if (!interaction.inGuild() || !interaction.guildId) {
        await interaction.reply({ content: "Command ini hanya bisa digunakan di dalam server.", ephemeral: true });
        return;
    }

    if (!interaction.memberPermissions?.has(PermissionsBitField.Flags.Administrator)) {
        await interaction.reply({ content: "Anda tidak memiliki izin untuk menggunakan perintah ini.", ephemeral: true });
        return;
    }

    if (cooldown < 0) {
        await interaction.reply({ content: "Cooldown tidak boleh negatif.", ephemeral: true });
        return;
    }

    // Simpan dalam milidetik supaya konsisten dengan command handler
    await config.upsert({
        key_name: "command_cooldown",
        value: (cooldown * 1000).toString(),
        status: "active"
    });

    await interaction.reply({ content: `Cooldown berhasil diatur ke ${cooldown} detik (${cooldown * 1000} ms).` });
};
