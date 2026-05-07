const { MessageFlags, PermissionsBitField, EmbedBuilder } = require("discord.js");
const Member = require("../models/PermsAdminTroll");
const Role = require("../models/Role");
const CrimeNote = require("../models/CrimeNoteMember");
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

    const guildRoles = await Role.find({ guildId: interaction.guildId }).lean();
    const allowedRoleIds = guildRoles.map((item) => item.roleId);

    const guildMembers = await Member.find({ guildId: interaction.guildId }).lean();
    const allowedUserIds = guildMembers.map((item) => item.usernameId);

    const memberRoleIds = getMemberRoleIds(interaction.member);
    const hasAllowedRole = memberRoleIds.some((roleId) => allowedRoleIds.includes(roleId));
    const hasAllowedUser = allowedUserIds.includes(interaction.user.id);

    if (!isAdmin && !hasAllowedRole && !hasAllowedUser) {
      await interaction.reply({
        content: "Kamu tidak punya izin untuk menggunakan perintah ini.",
        flags: MessageFlags.Ephemeral,
      });
      return;
    }


    const isNoteExist = await CrimeNote.findOne({ guildId: interaction.guildId, usernameId: target.id });

    if (!isNoteExist) {
      await CrimeNote.create({
        guildId: interaction.guildId,
        usernameId: target.id,
        history: [{ id_note: generateUniqueId(8, "note_"), date: new Date(), reason: reason }]
      })
    } else {
      isNoteExist.history.push({ id_note: generateUniqueId(8, "note_"), date: new Date(), reason: reason });
      await isNoteExist.save();
    }

    const warnEmbed = new EmbedBuilder()
      .setTitle("⚠️ Peringatan")
      .setDescription(`Kamu terkena peringatan ke: ${isNoteExist ? isNoteExist.history.length + 1 : 1}`)
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
