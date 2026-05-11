const { MessageFlags, PermissionsBitField, EmbedBuilder } = require("discord.js");
const config = require("../../models/config_tb");
const truncateMarkdown = require("../../function/truncate_markdown");

module.exports = async function rule_channel(interaction) {
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
    if (!interaction.memberPermissions?.has(PermissionsBitField.Flags.Administrator)) {
        await interaction.reply({
            content: "Anda tidak memiliki izin untuk menggunakan command ini.",
            flags: MessageFlags.Ephemeral,
        });
        return;
    }
    try {
        //tagih file .md untuk rules
        await interaction.reply({
            content: `Silakan unggah file .md yang berisi rules ke channel ini dalam waktu 60 detik. ketik "cancel" untuk membatalkan.`,
            flags: MessageFlags.Ephemeral,
        });


        const filter = (m) =>
            m.author.id === interaction.user.id &&
            (m.content.toLowerCase() === "cancel" ||
                (
                    m.attachments.size > 0 &&
                    m.attachments.first().name.endsWith('.md')
                )
            );


        const collected = await interaction.channel.awaitMessages({ filter, max: 1, time: 60000, errors: ['time'] })
            .catch(() => {
                interaction.editReply({
                    content: "Waktu habis. Silakan coba lagi dan pastikan untuk mengunggah file .md.",
                    flags: MessageFlags.Ephemeral,
                });
                return null;
            });

        if (!collected) return;

        if (collected.first().content.toLowerCase() === "cancel") {
            await interaction.editReply({
                content: "Pengaturan channel rules dibatalkan.",
                flags: MessageFlags.Ephemeral,
            });
            return;
        }

        const file = collected.first().attachments.first();
        const fileUrl = file.url;

        const isChannelExist = await config.findOne({ where: { key_name: "rule_channel" } });
        if (isChannelExist) {
            await config.update(
                { value: targetChannel.id },
                { where: { key_name: "rule_channel" } }
            );
        }
        else {
            await config.create({
                key_name: "rule_channel",
                value: targetChannel.id
            });
        }

        try {
            const res = await fetch(fileUrl);
            const fileContent = await res.text();

            const chunk = truncateMarkdown(fileContent);


            const embeds = chunk.map((content, index) => new EmbedBuilder()
                .setDescription(content)
                .setColor("#8d00d3")
                .setFooter({ text: `Bagian ${index + 1} dari ${chunk.length}` })
            );

            for (const embed of embeds) {
                await targetChannel.send({ embeds: [embed] });
            }

        } catch (error) {
            console.error(error);
            await interaction.editReply({
                content: "Terjadi kesalahan saat mengatur channel.",
                flags: MessageFlags.Ephemeral,
            });
            return;
        }
    }
    catch (error) {
        console.error(error);
        await interaction.editReply({
            content: "Terjadi kesalahan saat mengatur channel.",
            flags: MessageFlags.Ephemeral,
        });
    }
};