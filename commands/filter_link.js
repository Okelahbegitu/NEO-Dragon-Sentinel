const Member = require("../models/PermsAdminTroll");
const FilterChannel = require("../models/FilterLinkChannel");


module.exports = {
  name: "setup_filter_link",
  description: "Membuat channel yang ditentukan untuk menyeleksi link aneh ",
  options: [
    {
      name: "channel",
      description: "Pilih channel tempat link akan di pendingkan",
      type: 7,
      required: true,
    },
  ], async execute(interaction) {
    //if(true) return await interaction.reply("Fitur ini masih dalam pengembangan. Mohon tunggu update selanjutnya!");
    const channel = interaction.options.getChannel("channel");

    //simpan di db
    const isChannelExist = await FilterChannel.findOne({ guildId: interaction.guildId });

    if(isChannelExist){
      await FilterChannel.updateOne(
        {guildId: interaction.guildId},
        {channelId: interaction.options.getChannel("channel").id},
        {upsert: true}
      )
      console.log("Filter channel updated:", isChannelExist);
    } else {
      const newFilterChannel = new FilterChannel({
        guildId: interaction.guildId,
        channelId: interaction.options.getChannel("channel").id,
      });
      await newFilterChannel.save();
      console.log("Filter channel saved:", newFilterChannel); 
    }
    await interaction.reply(`Filter link telah di set ke berhasil dengan channel ${channel.name}`);
    }
};