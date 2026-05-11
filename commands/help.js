const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, ActionRow } = require("discord.js");
module.exports = {
    name: "help",
    description: "Menampilkan daftar perintah yang tersedia",

    async execute(interaction) {

        try {
            let page = "home";
            const message_expired = 300000; // 5 menit


            createButton = (current_page) => {
                return new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setCustomId("home")
                        .setLabel("🏡 Home")
                        .setStyle(ButtonStyle.Primary)
                        .setDisabled(current_page === "home"),
                    new ButtonBuilder()
                        .setCustomId("mod_commands")
                        .setLabel("👑 Mods")
                        .setStyle(ButtonStyle.Primary)
                        .setDisabled(current_page === "mod_commands"),
                    new ButtonBuilder()
                        .setCustomId("general_commands")
                        .setLabel("⚡ General")
                        .setStyle(ButtonStyle.Primary)
                        .setDisabled(current_page === "general_commands"),
                    new ButtonBuilder()
                        .setCustomId("settings_commands")
                        .setLabel("⚙️ Pengaturan")
                        .setStyle(ButtonStyle.Primary)
                        .setDisabled(current_page === "settings_commands"),
                );
            }

            // Embed untuk halaman utama
            const home_embed = new EmbedBuilder()
                .setTitle("📖 Help • EnderBot")
                .setDescription("Daftar perintah yang tersedia:")
                .addFields(
                    { name: "🏡 Home", value: "Halaman utama dengan daftar kategori perintah" },
                    { name: "👑 Mods", value: "Perintah untuk moderator" },
                    { name: "⚡ General", value: "Perintah umum" },
                    { name: "⚙️ Pengaturan", value: "Perintah untuk mengatur bot sesuai kebutuhan server (Role tinggi sahaja)" },
                    { name: "📌 Cara Menggunakan", value: "Klik tombol di bawah untuk melihat perintah dalam kategori tertentu." }
                )
                .setColor("#5865F2")
                .setFooter({ text: "EnderBot" });

            //Embed untuk halaman Moderasi
            const mod_embed = new EmbedBuilder()
                .setTitle("🛡️ Moderasi • EnderBot")
                .setDescription("Perintah moderasi:")
                .addFields(
                    { name: "⚠️ Warn", value: "`/warn` - Memberi peringatan" },
                    { name: "✒️ Set Expired Crime Note", value: "`/crimenote setexpired` -  Set catatan kriminal yang aktif ke kadaluarsa" },
                )
                .setColor("#5865F2")
                .setFooter({ text: "EnderBot" });

            //Embed untuk halaman General
            const general_embed = new EmbedBuilder()
                .setTitle("⚡ General • EnderBot")
                .setDescription("Perintah umum:")
                .addFields(
                    { name: "🏓 Ping", value: "`/ping` - Cek koneksi bot" },
                    { name: "📚 Help", value: "`/help` - Menampilkan daftar perintah" },
                    { name: "📝 Crime Note Show", value: "`/crimenote show` - Menampilkan catatan kriminal/warn" }
                )
                .setColor("#5865F2")
                .setFooter({ text: "EnderBot" });

            //Embed untuk halaman Pengaturan
            const settings_embed = new EmbedBuilder()
                .setTitle("⚙️ Pengaturan • EnderBot")
                .setDescription("Perintah konfigurasi khusus admin: ")
                .addFields(
                    { name: "📋 Set Channel Log", value: "`/settingbot setchannellog` - Mengatur channel log untuk aktivitas bot" },
                    { name: "🪤 Setup Trap", value: "`/settingbot setuptrap` - Mengatur channel jebakan untuk raid/mass-adveritement" },
                    { name: "🔗 Filter Link", value: "`/settingbot filterlink` - Mengatur channel untuk laporin adanya link aneh sekaligus mengaktifkan filter link" },
                    { name: "🧊 Cooldown", value: "`/settingbot cooldown` - Mengatur cooldown untuk menggunakan perintah (Default: 3 detik)" }
                )
                .setColor("#5865F2")
                .setFooter({ text: "EnderBot" });

            const embeds = {
                "home": home_embed,
                "mod_commands": mod_embed,
                "general_commands": general_embed,
                "settings_commands": settings_embed,
            }

            const { resource } = await interaction.reply({
                withResponse: true,
                embeds: [home_embed],
                components: [createButton("home")],
            });

            const msg = resource.message; // ← ambil message

            const filter = (i) => i.user.id === interaction.user.id;
            const collector = msg.createMessageComponentCollector({ filter, time: message_expired });

            collector.on("collect", async (i) => {
                page = i.customId;
                await i.update({
                    embeds: [embeds[page]],
                    components: [createButton(page)],
                });
            });

            collector.on("end", async () => {
                await msg.edit({ components: [] }); // ← pakai msg bukan response
            });

        } catch (error) {
            console.error("Error executing help command:", error);
            await interaction.reply({
                content: `Terjadi kesalahan saat menampilkan daftar perintah. :
            ${error.message}`,
                flags: 64, // Ephemeral
            });
        }
    }
};