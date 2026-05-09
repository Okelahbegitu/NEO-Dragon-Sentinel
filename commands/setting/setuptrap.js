const { MessageFlags, PermissionsBitField } = require("discord.js");
const TrapChannel = require("../../models/config_tb");

module.exports = async function setupTrap(interaction) {
    const targetChannel = interaction.options.getChannel("channel");

    if (!interaction.inGuild() || !interaction.guildId) {
        await interaction.reply({
            content: "Command ini hanya bisa digunakan di dalam server.",
            flags: MessageFlags.Ephemeral,
        });
        return;
    }

    if (targetChannel.type !== 0) {
        await interaction.reply({
            content: "Channel yang dipilih harus berupa text channel.",
            flags: MessageFlags.Ephemeral,
        });
        return;
    }

    if (interaction.memberPermissions?.has(PermissionsBitField.Flags.Administrator)) {
        try {
            const isChanelExist = await TrapChannel.findOne({ where: { key_name: "trap_channel" } });

            if (isChanelExist) {
                await TrapChannel.update(
                    { value: targetChannel.id },
                    { where: { key_name: "trap_channel" } }
                );
                console.log("Trap channel updated:", isChanelExist);
                await interaction.reply(`Channel ${targetChannel} telah berhasil diperbarui sebagai jebakan.`);
                return;
            } else {
                const newTrapChannel = await TrapChannel.create({
                    key_name: "trap_channel",
                    value: targetChannel.id
                });
                console.log("Trap channel saved:", newTrapChannel);
                await interaction.reply(`Channel ${targetChannel} telah berhasil dijadikan jebakan.`);
            }
        } catch (error) {
            console.error("Error saving trap channel:", error);
            await interaction.reply({
                content: "Terjadi kesalahan saat menyimpan channel jebakan.",
                flags: MessageFlags.Ephemeral,
            });
        }
    } else {
        await interaction.reply({
            content: "Kamu tidak punya izin untuk menggunakan perintah ini.",
            flags: MessageFlags.Ephemeral,
        });
        return;
    }
};
