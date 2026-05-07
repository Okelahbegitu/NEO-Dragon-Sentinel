const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require("discord.js"); // Tambahkan ini
const CrimeNoteMember = require("../models/CrimeNoteMember");
const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
const timezone = require("dayjs/plugin/timezone");

dayjs.extend(utc);
dayjs.extend(timezone);

module.exports = {
    name: "show_crime_note",
    description: "Menampilkan catatan kriminal dari seorang member",
    options: [
        {
            name: "member",
            description: "Pilih member yang ingin ditampilkan catatan kriminalnya",
            type: 6,
            required: true,
        }
    ],
    async execute(interaction) {
        const targetMember = interaction.options.getMember("member");
        let data;

        try {
            data = await CrimeNoteMember.findOne({
                guildId: interaction.guildId,
                usernameId: targetMember.id,
            });
        } catch (err) {
            console.error(err);
            return interaction.reply({ content: "Terjadi kesalahan data.", ephemeral: true });
        }

        if (!data || !data.history || data.history.length === 0) {
            return interaction.reply({ content: `Tidak ada catatan untuk ${targetMember}.`, ephemeral: true });
        }

        // --- KONFIGURASI PAGINATION ---
        const itemsPerPage = 3;
        const totalPages = Math.ceil(data.history.length / itemsPerPage);
        let currentIndex = 0;

        // Fungsi buat Embed
        const createEmbed = (pageIndex) => {
            const start = pageIndex * itemsPerPage;
            const currentItems = data.history.slice(start, start + itemsPerPage);

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
                    inline: false
                });
            });

            return embed;
        };

        // Fungsi buat Tombol
        const createRow = (pageIndex) => {
            return new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId("prev")
                    .setLabel("⬅️")
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(pageIndex === 0),
                new ButtonBuilder()
                    .setCustomId("next")
                    .setLabel("➡️")
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(pageIndex === totalPages - 1)
            );
        };

        // Kirim pesan pertama kali
        const response = await interaction.reply({
            embeds: [createEmbed(currentIndex)],
            components: [createRow(currentIndex)],
            fetchReply: true // Penting agar bisa dipasang collector
        });

        // --- COLLECTOR ---
        const filter = (i) => i.user.id === interaction.user.id;
        const collector = response.createMessageComponentCollector({ filter, time: 60000 });

        collector.on("collect", async (i) => {
            if (i.customId === "prev") currentIndex--;
            else if (i.customId === "next") currentIndex++;

            await i.update({
                embeds: [createEmbed(currentIndex)],
                components: [createRow(currentIndex)]
            });
        });

        collector.on("end", () => {
            // Matikan tombol kalau sudah timeout
            interaction.editReply({ components: [] }).catch(() => null);
        });
    }
}