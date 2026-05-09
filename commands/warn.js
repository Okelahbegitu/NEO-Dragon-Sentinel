const { MessageFlags, PermissionsBitField, EmbedBuilder } = require("discord.js");
const CrimeNote = require("../models/crime_note_members_tb");
const { generateUniqueId } = require("../function/id_maker");

function getMemberRoleIds(member) {
  if (!member || !member.roles) return [];

  if (Array.isArray(member.roles)) {
    return member.roles;
  }

  if (member.roles.cache) {
    return [...member.roles.cache.keys()];
  }

  return [];
}

module.exports = {
  name: "warn",
  description: "Memberikan peringatan kepada anggota yang melanggar aturan",
  options: [
    {
      name: "pelanggar",
      description: "Pilih anggota yang akan diberikan peringatan",
      type: 6,
      required: true,
    },
    {
      name: "alasan",
      description: "Alasan memberikan peringatan",
      type: 3,
      required: true,
    },
  ],
  async execute(interaction) {
    const target = interaction.options.getUser("pelanggar");
    const reason = interaction.options.getString("alasan") || "Tidak ada alasan.";

    if (!target) {
      await interaction.reply({ content: "User target tidak ditemukan.", flags: MessageFlags.Ephemeral });
      return;
    }

    const isAdmin = interaction.memberPermissions?.has(PermissionsBitField.Flags.Administrator);

    //const guildRoles = await Role.findAll({ where: { guild_id: interaction.guildId } });
    //const allowedRoleIds = guildRoles.map((item) => item.role_id);
//
    //const guildMembers = await Member.findAll({ where: { guild_id: interaction.guildId } });
    //const allowedUserIds = guildMembers.map((item) => item.username_id);
//
    //const memberRoleIds = getMemberRoleIds(interaction.member);
    //const hasAllowedRole = memberRoleIds.some((roleId) => allowedRoleIds.includes(roleId));
    //const hasAllowedUser = allowedUserIds.includes(interaction.user.id);

    if (!isAdmin ) {
      await interaction.reply({
        content: "Kamu tidak punya izin untuk menggunakan perintah ini.",
        flags: MessageFlags.Ephemeral,
      });
      return;
    }


    // For MySQL we store one row per warning (snake_case fields)
    const previousNotesCount = await CrimeNote.count({ where: { username_id: target.id } });

    await CrimeNote.create({
      username_id: target.id,
      crime_note: reason,
      date: new Date(),
      reason: reason,
      status: 'active',
    });

    const warnEmbed = new EmbedBuilder()
      .setTitle("⚠️ Peringatan")
      .setDescription(`Kamu terkena peringatan ke: ${previousNotesCount + 1}`)
      .addFields(
        { name: "Alasan:", value: reason, inline: true },
        { name: "Oleh:", value: interaction.user.tag, inline: true }
      )
      .setColor("#FF0000")
      .setFooter({ text: "NEO Dragon Sentinel (Jika terdapat kekeliruan, lakukan aju banding di ticket)" });

    await interaction.reply(`Peringatan telah diberikan kepada ${target.tag} dengan alasan: ${reason}`);

    try {
      await target.send({ embeds: [warnEmbed] });
    } catch (err) {
      await interaction.followUp({
        content: "Warn terkirim, tapi DM ke user gagal (mungkin DM ditutup).",
        flags: MessageFlags.Ephemeral,
      });
    }
  },
};
