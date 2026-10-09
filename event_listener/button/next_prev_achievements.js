const sharp = require("sharp");
const {
    ActionRowBuilder,
    AttachmentBuilder,
    ButtonBuilder,
    ButtonStyle
} = require("discord.js");
const renderAchievements = require("../../commands/achievements/show_achievements").renderAchievements;


module.exports = {
    name: "interactionCreate",

    async execute(interaction) {

        if (!interaction.isButton()) return;

        const customId = interaction.customId;

        if (
            !customId.startsWith("next_achievements_") &&
            !customId.startsWith("prev_achievements_")
        ) {
            return;
        }

        const [
            action,
            menu,
            viewerId,
            usernameId,
            indexString
        ] = customId.split("_");

        const index = parseInt(indexString, 10);

        if (interaction.user.id !== viewerId) {
            return interaction.reply({
                content: "❌ Kamu tidak bisa menggunakan tombol ini.",
                ephemeral: true
            });
        }

        const {
            bgSvg,
            iconOverlays,
            isHasNext,
            isHasPrev
        } = await renderAchievements(
            usernameId,
            index,
            interaction.client
        );

        const pngBuffer = await sharp(Buffer.from(bgSvg))
            .composite(iconOverlays)
            .png()
            .toBuffer();

        const attachment = new AttachmentBuilder(
            pngBuffer,
            { name: "achievements.png" }
        );

        const limit = 3;

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId(
                        `prev_achievements_${viewerId}_${usernameId}_${index - limit}`
                    )
                    .setLabel("⬅️")
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(!isHasPrev),

                new ButtonBuilder()
                    .setCustomId(
                        `next_achievements_${viewerId}_${usernameId}_${index + limit}`
                    )
                    .setLabel("➡️")
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(!isHasNext)
            );

        await interaction.update({
            files: [attachment],
            components: [row]
        });
    }
};