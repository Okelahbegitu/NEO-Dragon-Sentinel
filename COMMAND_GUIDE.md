# Cara Membuat Command di Project Ini

Project ini memakai `discord.js` slash command. Semua command disimpan di folder `commands/`, lalu otomatis di-load oleh `index.js` dan didaftarkan ke Discord lewat `command-deployment.js`.

## Struktur Singkat

- `index.js` - entrypoint bot, load command, connect database, lalu login ke Discord.
- `command-deployment.js` - mendaftarkan slash command ke Discord.
- `commands/` - tempat semua file command.
- `handlers/commandHandler.js` - menangani event saat slash command dipanggil.
- `models/` - schema MongoDB/Mongoose untuk data yang disimpan.

## Format Dasar Command

Buat file baru di folder `commands/`, misalnya `commands/hello.js`:

```js
module.exports = {
  name: "hello",
  description: "Contoh command sederhana",
  async execute(interaction) {
    await interaction.reply("Halo!");
  },
};
```

## Cara Kerjanya

`index.js` akan membaca semua file `.js` di `commands/` dan mengambil command yang punya:

- `name`
- `description`
- `execute()`

Kalau command sudah memenuhi format itu, command akan otomatis masuk ke `client.commands`.

## Kalau Command Punya Argumen

Tambahkan `options` di object command, lalu baca nilainya dari `interaction.options`.

Contoh:

```js
module.exports = {
  name: "say",
  description: "Mengirim teks ke chat",
  options: [
    {
      name: "pesan",
      description: "Isi pesan yang mau dikirim",
      type: 3,
      required: true,
    },
  ],
  async execute(interaction) {
    const pesan = interaction.options.getString("pesan");
    await interaction.reply(pesan);
  },
};
```

Kode `type` yang sering dipakai di project ini:

- `3` = string
- `6` = user
- `7` = channel

## Kalau Command Butuh Database

Import model dari folder `models/`, lalu pakai `mongoose` seperti command lain di project ini.

Contoh pola:

```js
const Member = require("../models/Member");

async execute(interaction) {
  await Member.create({
    guildId: interaction.guildId,
    usernameId: interaction.user.id,
  });
}
```

Pastikan MongoDB sudah tersambung lewat `MONGO_URI` di `.env` atau MongoDB lokal aktif di `127.0.0.1:27017`.

## Setelah Menambah Command Baru

1. Buat file baru di `commands/`.
2. Pastikan ada `name`, `description`, dan `execute()`.
3. Kalau command punya `options`, tambahkan juga.
4. Jalankan deployment command agar Discord mengenali command baru:

```bash
node command-deployment.js
```

5. Restart bot:

```bash
node index.js
```

## Contoh Lengkap

```js
module.exports = {
  name: "echo",
  description: "Mengulang pesan user",
  options: [
    {
      name: "teks",
      description: "Pesan yang mau diulang",
      type: 3,
      required: true,
    },
  ],
  async execute(interaction) {
    const teks = interaction.options.getString("teks");
    await interaction.reply(teks);
  },
};
```

## Hal yang Perlu Diingat

- Nama file bebas, tapi isi object harus konsisten.
- Command yang tidak punya `name` atau `description` tidak akan ikut didaftarkan.
- Kalau command gagal dijalankan, error ditangkap oleh `handlers/commandHandler.js`.
- Kalau command baru tidak muncul di Discord, jalankan ulang `command-deployment.js`.

## Catatan untuk Project Ini

Project ini sekarang punya command seperti:

- `/ping`
- `/help`
- `/warn`
- `/add_perms_admin_troll`
- `/setup_filter_link`

Jadi kalau kamu mau bikin command baru, tinggal ikuti pola yang sama seperti file-file di folder `commands/`.