module.exports = {
  name: "setup_filter_link",
  description: "Aktifkan atau nonaktifkan filter link di server ini. (On dev)",
  options: [
    {
      name: "channel",
      description: "Pilih channel tempat link akan di pendingkan",
      type: 7,
      required: true,
    },
    {
      name: "status",
      description: "Status filter link",
      type: 3,
      required: true,
      choices: [
        { name: "Aktif", value: "active" },
        { name: "Nonaktif", value: "inactive" }
      ]
    }
  ], async execute(interaction) {
    if(true) return await interaction.reply("Fitur ini masih dalam pengembangan. Mohon tunggu update selanjutnya!");
    const channel = interaction.options.getChannel("channel");
    const status = interaction.options.getString("status");

    //simpan di db
    await interaction.reply(`Filter link telah di set ke ${status} dengan channel ${channel.name}`);
    }
};