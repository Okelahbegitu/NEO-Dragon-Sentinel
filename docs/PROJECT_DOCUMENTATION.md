# Project Documentation - Sebastian The Cat

Dokumen ini menjelaskan bagaimana proyek bot Discord ini disusun, bagaimana alurnya berjalan, dan file apa saja yang penting untuk dipahami saat kamu baru mulai memakai discord.js.

## Gambaran Umum

Project ini adalah bot Discord berbasis `discord.js` v14 dengan struktur `CommonJS`. Bot:

- memuat slash command dari folder `commands/`
- memuat event listener dari folder `event_listener/`
- menyimpan data ke MongoDB melalui `mongoose`
- memakai `.env` untuk konfigurasi rahasia

## Tech Stack

- `discord.js` untuk koneksi ke Discord API
- `mongoose` dan `mongodb` untuk database
- `axios` untuk request ke VirusTotal
- `dotenv` untuk membaca environment variable

## File Penting

- [index.js](../index.js) - entrypoint bot, membuat client, load command, load event, connect database, lalu login
- [command-deployment.js](../command-deployment.js) - mendaftarkan slash command ke Discord
- [handlers/commandHandler.js](../handlers/commandHandler.js) - mengeksekusi slash command saat interaction diterima
- [handlers/eventHandler.js](../handlers/eventHandler.js) - mendaftarkan semua event listener dari folder event_listener
- [commands/](../commands) - semua slash command
- [event_listener/](../event_listener) - listener untuk event Discord seperti pesan masuk
- [models/](../models) - schema Mongoose

## Alur Kerja Bot

### 1. Start bot

Saat kamu menjalankan `node index.js`, file ini:

1. memanggil `dotenv.config()`
2. membuat `Client` Discord
3. membaca semua file command dari folder `commands/`
4. mendaftarkan handler command dan event
5. connect ke MongoDB
6. login ke Discord memakai `DISCORD_TOKEN`

### 2. Slash command dipanggil

`handlers/commandHandler.js` mendengar event `InteractionCreate`. Jika interaction adalah chat input command, handler akan:

1. mengambil command dari `client.commands`
2. menjalankan `command.execute(interaction)`
3. menampilkan pesan error yang ramah kalau command gagal

### 3. Event listener dipanggil

`handlers/eventHandler.js` membaca semua file `.js` dari `event_listener/` lalu mengikatnya ke `client.on(event.name, ...)`.

### 4. Command didaftarkan ke Discord

`command-deployment.js` mengambil semua command dari folder `commands/`, memfilter command yang punya `name` dan `description`, lalu mengirimnya sebagai global slash commands.

## Environment Variable

File `.env` yang dipakai proyek ini:

- `DISCORD_TOKEN` - token bot Discord
- `CLIENT_ID` - application ID bot Discord
- `GUILD_ID` - biasanya dipakai untuk kebutuhan server tertentu
- `MONGO_URI` - koneksi database MongoDB Atlas atau lokal
- `TOTAL_VIRUS_KEY` - API key VirusTotal untuk fitur filter link

## Command yang Ada

Berikut command yang benar-benar ada di repo ini:

- `/ping` - cek bot aktif
- `/help` - menampilkan daftar command
- `/warn` - memberi peringatan ke user
- `/setup_trap` - menyimpan channel jebakan untuk anti-advertising
- `/add_perms_admin_troll` - memberi izin admin berbasis database
- `/remove_perms_admin_troll` - menghapus izin admin berbasis database
- `/setup_filter_link` - menyimpan channel untuk filter link suspicious

## Event Listener yang Ada

- `event_listener/suspicos_link.js` - memeriksa link dari pesan dan mengirim ke VirusTotal
- `event_listener/channel_trap_trigger.js` - menangani jebakan channel untuk advertising/raid

## Model Database

Model yang ada di folder `models/`:

- `Member` - daftar user yang diberi izin admin berbasis database
- `Role` - daftar role yang diberi izin admin berbasis database
- `TrapChannel` - channel jebakan untuk anti-advertising
- `FilterLinkChannel` - channel tujuan filter link suspicious

## Pola Kode Command

Semua command mengikuti pola object CommonJS seperti ini:

```js
module.exports = {
  name: "nama_command",
  description: "Deskripsi command",
  options: [],
  async execute(interaction) {
    await interaction.reply("Halo");
  },
};
```

Field yang penting:

- `name` - nama slash command
- `description` - deskripsi command
- `options` - argumen command, opsional
- `execute()` - fungsi utama yang dijalankan saat command dipanggil

## Pola Kode Event Listener

Event listener juga memakai object CommonJS:

```js
module.exports = {
  name: Events.MessageCreate,
  async execute(message) {
    // logic di sini
  },
};
```

## Contoh Setup Awal

1. Isi `.env`
2. Install dependency dengan `npm install`
3. Jalankan `node command-deployment.js` untuk mendaftarkan slash command
4. Jalankan `node index.js`

## Hal yang Perlu Diingat

- Project ini memakai `CommonJS`, jadi gunakan `require()` dan `module.exports`, bukan `import` dan `export`.
- Jika ingin membaca isi pesan, aktifkan `Message Content Intent` di Discord Developer Portal.
- Jika command baru tidak muncul, jalankan ulang `command-deployment.js`.
- Jika fitur database gagal, cek koneksi MongoDB di `.env` dan akses jaringan Atlas.

## Catatan Khusus Fitur Filter Link

Fitur filter link memakai alur:

1. pesan masuk ke event listener
2. bot membaca URL dari isi pesan
3. URL dikirim ke VirusTotal
4. hasil analisis menentukan apakah link aman atau tidak
5. jika berbahaya, pesan dihapus dan notifikasi dikirim ke channel filter

## Rekomendasi Belajar Untuk Pemula

Kalau kamu baru pertama kali pakai discord.js, fokus dulu ke urutan ini:

1. pahami `Client` dan `GatewayIntentBits`
2. pahami perbedaan `slash command` dan `event listener`
3. pahami `interaction.reply()` dan `message.delete()`
4. pahami cara menyimpan data dengan Mongoose
5. baru lanjut ke API eksternal seperti VirusTotal
