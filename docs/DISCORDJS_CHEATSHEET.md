# Discord.js v14 Cheatsheet

Ringkasan cepat untuk kerja di project ini.

## 1. Membuat Client

```js
const { Client, GatewayIntentBits } = require("discord.js");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});
```

## 2. Menangkap Event

```js
const { Events } = require("discord.js");

client.on(Events.ClientReady, () => {
  console.log("Bot siap");
});

client.on(Events.MessageCreate, async (message) => {
  if (message.author.bot) return;
  if (!message.guild) return;
});
```

## 3. Struktur Slash Command

```js
module.exports = {
  name: "ping",
  description: "Balas Pong!",
  async execute(interaction) {
    await interaction.reply("Pong!");
  },
};
```

## 4. Reply Interaction

```js
await interaction.reply("Halo");
```

Ephemeral response:

```js
const { MessageFlags } = require("discord.js");

await interaction.reply({
  content: "Pesan ini hanya terlihat oleh user.",
  flags: MessageFlags.Ephemeral,
});
```

## 5. Cek Permission

```js
const { PermissionsBitField } = require("discord.js");

if (interaction.memberPermissions?.has(PermissionsBitField.Flags.Administrator)) {
  // allowed
}
```

## 6. Ambil Nilai Options

String:

```js
const text = interaction.options.getString("alasan");
```

User:

```js
const user = interaction.options.getUser("user");
```

Channel:

```js
const channel = interaction.options.getChannel("channel");
```

## 7. Format Option Slash Command

```js
options: [
  {
    name: "user",
    description: "Pilih user",
    type: 6,
    required: true,
  },
]
```

Tipe yang sering dipakai:

- `3` = string
- `6` = user
- `7` = channel

## 8. Kirim Embed

```js
const { EmbedBuilder } = require("discord.js");

const embed = new EmbedBuilder()
  .setTitle("Judul")
  .setDescription("Isi embed")
  .setColor("#5865F2");

await interaction.reply({ embeds: [embed] });
```

## 9. Handle Error Command

```js
try {
  await command.execute(interaction);
} catch (error) {
  console.error(error);
  await interaction.reply({
    content: "Terjadi error saat menjalankan command.",
    flags: MessageFlags.Ephemeral,
  });
}
```

## 10. Cek Pesan Masuk

```js
client.on(Events.MessageCreate, async (message) => {
  if (message.author.bot) return;
  if (!message.content) return;
});
```

## 11. Ambil Member Server

```js
const member = await interaction.guild.members.fetch(user.id).catch(() => null);
```

## 12. Kirim DM ke User

```js
try {
  await user.send("Pesan DM");
} catch (error) {
  console.log("DM gagal");
}
```

## 13. Hapus Pesan

```js
await message.delete();
```

## 14. Checklist Debug Cepat

- Pastikan bot pakai `Message Content Intent` kalau membaca isi pesan
- Pastikan command sudah didaftarkan ulang lewat `command-deployment.js`
- Pastikan `DISCORD_TOKEN` dan `CLIENT_ID` ada di `.env`
- Pastikan koneksi MongoDB aktif kalau command pakai database
- Pastikan event listener diekspor dengan `module.exports`

## 15. Pola yang Benar untuk Repo Ini

Karena project ini memakai `CommonJS`, format yang benar adalah:

```js
const sesuatu = require("sesuatu");

module.exports = {
  name: "contoh",
  async execute() {},
};
```

Bukan:

```js
import sesuatu from "sesuatu";
export default {};
```
