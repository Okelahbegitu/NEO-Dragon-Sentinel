const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, ActionRow } = require("discord.js");
const CrimeNoteMember = require("../../models/crime_note_members_tb");
const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
const timezone = require("dayjs/plugin/timezone");

dayjs.extend(utc);
dayjs.extend(timezone);

module.exports = async function showCrimeNote(interaction) {
    const targetMember = interaction.options.getMember("member");

    if (!targetMember) {
        return interaction.reply({ content: "Silakan pilih member yang valid.", ephemeral: true });
    }

    let data;

    try {
        data = await CrimeNoteMember.findAll({
            where: { username_id: targetMember.id },
            order: [["date", "DESC"]],
        });
    } catch (err) {
        console.error(err);
        return interaction.reply({ content: "Terjadi kesalahan data.", ephemeral: true });
    }

    if (!data || data.length === 0) {
        return interaction.reply({ content: `Tidak ada catatan untuk ${targetMember}.`, ephemeral: true });
    }

    const itemsPerPage = 3;
    const totalPages = Math.ceil(data.length / itemsPerPage);
    let currentIndex = 0;

    const createEmbed = (pageIndex) => {
        const start = pageIndex * itemsPerPage;
        const currentItems = data.slice(start, start + itemsPerPage);

        const embed = new EmbedBuilder()
            .setTitle(`Catatan Kriminal: ${targetMember.user.tag}`)
            .setDescription(`Menampilkan halaman ${pageIndex + 1} dari ${totalPages}`)
            .setColor("Red")
            .setTimestamp();

        currentItems.forEach((item) => {
            const status = item.status === "active" ? "🔴 Aktif" : "⚪ Kadaluarsa";
            const date = dayjs(item.date).tz("Asia/Jakarta").format("DD-MM-YYYY HH:mm");
            embed.addFields({
                name: `ID: ${item.id_note} | ${status}`,
                value: `**Alasan:** ${item.reason}\n**Tanggal:** ${date}`,
                inline: false,
            });
        });

        return embed;
    };

    const createRow = (pageIndex) => {
        return new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId("crime_note_prev")
                .setLabel("⬅️")
                .setStyle(ButtonStyle.Primary)
                .setDisabled(pageIndex === 0),
            new ButtonBuilder()
                .setCustomId("crime_note_next")
                .setLabel("➡️")
                .setStyle(ButtonStyle.Primary)
                .setDisabled(pageIndex === totalPages - 1)
        );
    };

    const response = await interaction.reply({
        embeds: [createEmbed(currentIndex)],
        components: [createRow(currentIndex)],
        fetchReply: true,
    });

    const filter = (i) => i.user.id === interaction.user.id;
    const collector = response.createMessageComponentCollector({ filter, time: 60000 });

    collector.on("collect", async (i) => {
        if (i.customId === "crime_note_prev") currentIndex--;
        else if (i.customId === "crime_note_next") currentIndex++;

        await i.update({
            embeds: [createEmbed(currentIndex)],
            components: [createRow(currentIndex)],
        });
    });

    collector.on("end", () => {
        interaction.editReply({ components: [] }).catch(() => null);
    });
};
