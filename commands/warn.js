const { MessageFlags, PermissionsBitField } = require("discord.js");
const Member = require("../models/Member");
const Role = require("../models/Role");

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
      required: false,
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

    await interaction.reply(`Peringatan telah diberikan kepada ${target.tag}.`);

    try {
      await target.send(`Kamu terkena warn karena: ${reason}`);
    } catch (err) {
      await interaction.followUp({
        content: "Warn terkirim, tapi DM ke user gagal (mungkin DM ditutup).",
        flags: MessageFlags.Ephemeral,
      });
    }
  },
};
