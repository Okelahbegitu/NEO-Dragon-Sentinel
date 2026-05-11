const { Events, EmbedBuilder, time } = require('discord.js');
const config = require('../models/config_tb');

module.exports = {
    name: Events.GuildMemberAdd,
    async execute(member) {
        const welcome_channel_id = await config.findOne({ where: { key_name: "welcomebye_channel" } });
        if (!welcome_channel_id) return;

        const welcome_channel = member.guild.channels.cache.get(welcome_channel_id.value);
        if (!welcome_channel) return;

        const create_at = member.user.createdAt;
        const diff = Date.now() - create_at.getTime();

        const accountAgeInDays = Math.floor(diff / (1000 * 60 * 60 * 24));
        const accountAgeInYears = Math.floor(accountAgeInDays / 365);
        const accountAgeInMonths = Math.floor((accountAgeInDays % 365) / 30); // sisa bulan setelah tahun
        const remainingDays = accountAgeInDays % 30; // sisa hari setelah bulan

        const embed = new EmbedBuilder()
            .setTitle("Welcome to Ender Sanctum!")
            .setDescription(`Selamat datang, <@${member.id}>!`)
            .addFields
            (
                { name: "👥 Member ke", value: `#${member.guild.memberCount}` },
                { name: "📅 Akun dibuat", value: `#${member.user.createdAt.toDateString()}` },
                { name: "⏳ Usia Akun", value: `${accountAgeInYears > 0 ? `${accountAgeInYears} tahun, ` : ''}  ${accountAgeInMonths > 0 ? `${accountAgeInMonths} bulan, ` : ''}  ${accountAgeInDays > 0 ? `${remainingDays} hari` : 'Baru saja'}` }
            )
            .setColor("#00ff00")
            .setThumbnail(member.user.displayAvatarURL())
            .setAuthor({ name: member.user.tag, iconURL: member.user.displayAvatarURL() })
            .setFooter({ text: "Please read the rules in the codex-sanctum first" }, timestamp = Date.now());

        await welcome_channel.send({ embeds: [embed] });
    }
}