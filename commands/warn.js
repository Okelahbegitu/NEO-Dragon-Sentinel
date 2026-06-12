const {
  MessageFlags,
  PermissionsBitField,
  EmbedBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
} = require("discord.js");

const CrimeNote = require("../models/crime_note_members_tb");

/*
========================================
FUNCTION UTAMA
========================================
*/

async function giveWarn({
  target,
  reason,
  moderator,
  guildId,
  timeoutDuration = 0,

}) {

  if (!target) {
    throw new Error("Target tidak ditemukan.");
  }

  const previousNotesCount = await CrimeNote.count({
    where: {
      username_id: target.id,
      status: "active",
    },
  }) + 1; // +1 untuk warn yang akan diberikan sekarang

  //ban kalau udh lewat 3 kali warn yang aktif
  if (previousNotesCount == 2 && timeoutDuration > 0) {
    await target.timeout(timeoutDuration, reason).catch(console.error);
  } else if (previousNotesCount >= 3) {
    //lakukan ban
    await target.ban({ reason: "Melewati batas warn aktif (3)" });
  }

  await CrimeNote.create({
    username_id: target.id,
    crime_note: reason,
    date: new Date(),
    reason,
    status: "active",
  });

  // Build warn embed and notify target via DM
  const moderatorName =
    typeof moderator === "string"
      ? moderator
      : moderator?.tag ?? moderator?.user?.tag ?? "Unknown";

  const warnEmbed = new EmbedBuilder()
    .setTitle("⚠️ Peringatan")
    .setDescription(`Kamu terkena peringatan ke: ${previousNotesCount}`)
    .addFields(
      { name: "Alasan:", value: reason, inline: true },
      { name: "Oleh:", value: moderatorName, inline: true }
    )
    .setColor("#FF0000")
    .setFooter({
      text: "Dragon Sentinel (Jika terdapat kekeliruan, lakukan aju banding di ticket)",
    });

  try {
    await target.send({ embeds: [warnEmbed] });
  } catch (err) {
    console.error("Error sending warn DM to user:", err);
  }

  return {
    totalWarn: previousNotesCount,
  };
}

/*
========================================
SLASH COMMAND
========================================
*/

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
    {
      name: "timeout",
      description: "Lama timeout (contoh: 1d, 12h, 30m)",
      type: 3,
      required: false,
    }
  ],

  async execute(interaction) {

    const target = interaction.options.getMember("pelanggar");
    let timeout_duration = interaction.options.getString("timeout") || null;

    const reason =
      interaction.options.getString("alasan") ||
      "Tidak ada alasan.";

    const isAdmin =
      interaction.memberPermissions?.has(
        PermissionsBitField.Flags.Administrator
      );

    const previousNotesCount = await CrimeNote.count({
      where: {
        username_id: target.id,
      },
    });

    if (!isAdmin) {
      await interaction.reply({
        content:
          "Kamu tidak punya izin untuk menggunakan perintah ini.",
        flags: MessageFlags.Ephemeral,
      });

      return;
    }

    const total_warn = await CrimeNote.count({
      where: {
        username_id: target.id,
        status: "active",
      },
    }) + 1; // +1 untuk warn yang akan diberikan sekarang
    // Konversi timeout kalau ada input
    if (timeout_duration != null) {
      if (timeout_duration.includes('d')) {
        timeout_duration = parseInt(timeout_duration) * 24 * 60 * 60 * 1000;
      } else if (timeout_duration.includes('h')) {
        timeout_duration = parseInt(timeout_duration) * 60 * 60 * 1000;
      } else if (timeout_duration.includes('m')) {
        timeout_duration = parseInt(timeout_duration) * 60 * 1000;
      } else {
        return interaction.reply({
          content: `Format timeout tidak valid. Gunakan format: 1d, 12h, 30m`,
          flags: MessageFlags.Ephemeral,
        });
      }
    }

    // Warn ke-2 tapi tidak ada timeout input
    if (total_warn == 2 && timeout_duration == null) {
      return interaction.reply({
        content: `User ini sudah warn ke-2! Harap sertakan durasi timeout. (contoh: 1d, 12h, 30m)`,
        flags: MessageFlags.Ephemeral,
      });
    }

    // Proses giveWarn
    const result = await giveWarn({
      target,
      reason,
      moderator: interaction.user.tag,
      guildId: interaction.guildId,
      timeoutDuration: timeout_duration ?? 0,
    });

    await interaction.reply({
      content: `✅ Warn diberikan kepada ${target.user.tag}! Total: ${result.totalWarn} dan dengan alasan: ${reason}`,
    });;


    /*
    ========================================
    EXPORT FUNCTION
    ========================================
    */

  },
  giveWarn,

};