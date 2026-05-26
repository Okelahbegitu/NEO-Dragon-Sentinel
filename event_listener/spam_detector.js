const warn = require('../commands/warn');
const cache = new Map();

// Pesan dihitung dalam jendela waktu tertentu, bukan dihitung selamanya.
const SPAM_WINDOW_MS = 5_000;
// Kalau 5 pesan masuk sangat cepat, user dianggap spam.
const SPAM_THRESHOLD = 5;
// Riwayat spam disimpan 24 jam supaya repeat spam bisa dilacak.
const SPAM_COUNTER_WINDOW_MS = 24 * 60 * 60 * 1000;

const cache_user_spam = new Map();

function getRecentTimestamps(userId, currentTime) {
    const timestamps = cache.get(userId) || [];

    // Buang timestamp yang sudah lewat dari jendela spam.
    return timestamps.filter(timestamp => currentTime - timestamp < SPAM_WINDOW_MS);
}

function updateSpamCounter(userId, currentTime) {
    const spamData = cache_user_spam.get(userId);

    // Pertama kali kena spam: mulai hitung dari 1.
    if (!spamData) {
        cache_user_spam.set(userId, { timestamp: currentTime, manySpam: 1 });
        return;
    }

    // Kalau catatan spam sudah lewat 24 jam, reset hitungan.
    if (currentTime - spamData.timestamp >= SPAM_COUNTER_WINDOW_MS) {
        cache_user_spam.set(userId, { timestamp: currentTime, manySpam: 1 });
        return;
    }

    // Kalau masih dalam periode 24 jam, naikkan total spam.
    cache_user_spam.set(userId, {
        timestamp: currentTime,
        manySpam: spamData.manySpam + 1,
    });
}

module.exports = {
    name: 'messageCreate',

    async execute(message) {
        // Abaikan bot dan pesan di luar server.
        if (message.author.bot) return;
        if (!message.guild) return;

        //Kecualikan tempat spam yang sudah di whitelist
        if(message.channel.id === '901086791451426886') return;

        const userId = message.author.id;
        const currentTime = Date.now();

        // Ambil hanya pesan terbaru dari user ini.
        const validTimestamps = getRecentTimestamps(userId, currentTime);
        validTimestamps.push(currentTime);
        cache.set(userId, validTimestamps);

        // Kalau belum mencapai ambang spam, hentikan di sini.
        if (validTimestamps.length < SPAM_THRESHOLD) {
            return;
        }

        // User sudah dianggap spam, jadi reset cache lokal agar hitungan berikutnya mulai fresh.
        console.log(`${message.author.tag} spam`);
        cache.delete(userId);

        //timeout user 5 * berapa kali spam sebelumnya
        const timeoutDuration = 5 * 60 * 1000 * (cache_user_spam.get(userId)?.manySpam || 1);
        await message.member.timeout(timeoutDuration, 'Spamming').catch(console.error);

        // Catat bahwa user ini pernah terdeteksi spam.
        updateSpamCounter(userId, currentTime);

        // Beri warn ke user yang spam.
        await warn.giveWarn({
            target: message.author,
            reason: 'Spamming',
            moderator: message.client.user,
            guildId: message.guild.id,
        }).catch(console.error);
    }
};