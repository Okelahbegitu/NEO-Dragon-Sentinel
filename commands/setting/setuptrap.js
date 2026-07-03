const { PermissionsBitField, ChannelType, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const TrapChannel = require("../../models/config_tb");

const TRAP_CHANNEL_KEY = "trap_channel";
const TRAP_EMBEDDED_MESSAGE_KEY = "trap_embeded_message_id";

/**
 * Create trap channel warning embed and button
 * @returns {Object} { embeds, components }
 */
function createTrapChannelUI() {
    const warn_embed = new EmbedBuilder()
        .setColor("Red")
        .setTitle("Peringatan! || Warning!")
        .addFields(
            { name: "JANGAN KIRIM PESAN DI SINI", value: "Channel ini adalah security trap untuk mendeteksi akun hack, bot spam, dan scam link. Kalau kamu mengirim pesan di sini, Ender Bot akan mencatat aktivitasmu. Pesanmu akan dihapus dan akunmu bisa langsung dibanned demi keamanan server.", inline: true },
            { name: "DO NOT SEND MESSAGES HERE", value: "This channel is a security trap for compromised accounts, spam bots, and scam links. If you send a message here, Ender Bot will log your activity. Your message will be deleted and your account may be banned to protect the server.", inline: true }
        );

    const ban_counter = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('ban_counter')
                .setLabel('Ban Counter: 0')
                .setStyle(ButtonStyle.Secondary)
        );

    return { embeds: [warn_embed], components: [ban_counter] };
}

/**
 * Set up a trap channel for the server
 * @param {CommandInteraction} interaction - Discord interaction object
 */
module.exports = async function setupTrap(interaction) {
    // Defer reply immediately to avoid timeout
    await interaction.deferReply({ ephemeral: true });

    try {
        // Validate if command is used in a guild
        if (!interaction.inGuild() || !interaction.guildId) {
            await interaction.editReply({
                content: "Command ini hanya bisa digunakan di dalam server.",
            });
            return;
        }

        // Validate admin permissions
        if (!interaction.memberPermissions?.has(PermissionsBitField.Flags.Administrator)) {
            await interaction.editReply({
                content: "Kamu tidak punya izin untuk menggunakan perintah ini.",
            });
            return;
        }

        const targetChannel = interaction.options.getChannel("channel");

        // Validate channel existence and type
        if (!targetChannel || targetChannel.type !== ChannelType.GuildText) {
            await interaction.editReply({
                content: "Channel yang dipilih harus berupa text channel.",
            });
            return;
        }

        // Save trap channel config to database
        const existingTrapChannel = await TrapChannel.findOne({
            where: { key_name: TRAP_CHANNEL_KEY }
        });

        if (existingTrapChannel) {
            await TrapChannel.update(
                { value: targetChannel.id },
                { where: { key_name: TRAP_CHANNEL_KEY } }
            );
            console.log("Trap channel updated:", targetChannel.id);
        } else {
            await TrapChannel.create({
                key_name: TRAP_CHANNEL_KEY,
                value: targetChannel.id
            });
            console.log("Trap channel created with ID:", targetChannel.id);
        }

        // Send warning embed and button to trap channel
        const uiComponents = createTrapChannelUI();
        const sentMessage = await targetChannel.send(uiComponents);

        // Save embedded message ID to database
        await TrapChannel.upsert({
            key_name: TRAP_EMBEDDED_MESSAGE_KEY,
            value: sentMessage.id
        });

        console.log("Trap embedded message saved:", sentMessage.id);

        // Send success reply
        await interaction.editReply(`Channel ${targetChannel} telah berhasil dikonfigurasi sebagai trap channel.`);
    } catch (error) {
        console.error("Error setting up trap channel:", error);
        await interaction.editReply({
            content: "Terjadi kesalahan saat menyimpan channel jebakan: " + error.message,
        }).catch(err => console.error("Failed to edit reply:", err));
    }
};
