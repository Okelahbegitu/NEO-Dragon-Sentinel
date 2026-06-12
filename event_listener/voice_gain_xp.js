const { Events } = require("discord.js");
const add_xp = require("../function/add_xp");

let XP_GAIN = 10;
const XP_INTERVAL_MS = 5 * 60 * 1000; // 5 menit
const TICK_MS = 60 * 1000;
const MIN_NON_BOT_MEMBERS = 1;
const SELF_DEAFEN_GAIN_XP = false;

const voiceUsers = new Map();
let voiceXpInterval = null;

async function processVoiceXp(client) {
    const now = Date.now();

    for (const [userId, userData] of voiceUsers.entries()) {
        if (now - userData.lastGainXp < XP_INTERVAL_MS) continue;

        const guild = client.guilds.cache.get(userData.guildId);
        if (!guild) {
            voiceUsers.delete(userId);
            continue;
        }

        const member = await guild.members.fetch(userId).catch(() => null);
        if (!member || member.user.bot || !member.voice.channel) {
            voiceUsers.delete(userId);
            continue;
        }

        if (!SELF_DEAFEN_GAIN_XP && member.voice.selfDeaf) {
            continue;
        }

        const nonBotMembers = member.voice.channel.members.filter((m) => !m.user.bot);
        if (nonBotMembers.size < MIN_NON_BOT_MEMBERS) continue;

        let xpGain = XP_GAIN;
        const roles = member.roles.cache;

        if (roles.has("1032920319113052161")) {
            xpGain *= 3.5;
        } else if (roles.has("1467477490573508679")) {
            xpGain *= 2;
        }

        await add_xp(member, xpGain);
        userData.lastGainXp = now;
        console.log(`User ${member.user.username} gained ${xpGain} XP in ${member.voice.channel.name}`);
    }
}

function ensureVoiceXpInterval(client) {
    if (voiceXpInterval) return;

    voiceXpInterval = setInterval(() => {
        processVoiceXp(client).catch((error) => {
            console.error("Error processing voice XP:", error);
        });
    }, TICK_MS);
}

module.exports = {
    name: Events.VoiceStateUpdate,
    async execute(oldState, newState) {
        if (!newState.guild || !newState.member || newState.member.user.bot) return;

        ensureVoiceXpInterval(newState.client);

        const userId = newState.id;
        const oldChannelId = oldState.channelId;
        const newChannelId = newState.channelId;

        if (oldChannelId === null && newChannelId !== null) {
            voiceUsers.set(userId, {
                joinedAt: Date.now(),
                guildId: newState.guild.id,
                lastGainXp: Date.now()
            });
            console.log(`User ${newState.member.user.username} joined voice channel ${newState.channel.name}`);
            return;
        }

        if (oldChannelId !== null && newChannelId === null) {
            const userData = voiceUsers.get(userId);
            if (!userData) return;

            const durationSeconds = Math.floor((Date.now() - userData.joinedAt) / 1000);
            voiceUsers.delete(userId);
            console.log(`User ${newState.member.user.username} left voice channel ${oldState.channel.name} after ${durationSeconds} seconds`);
            return;
        }

        if (oldChannelId !== null && newChannelId !== null && oldChannelId !== newChannelId) {
            voiceUsers.set(userId, {
                joinedAt: Date.now(),
                guildId: newState.guild.id,
                lastGainXp: Date.now()
            });
            console.log(`User ${newState.member.user.username} moved voice channel to ${newState.channel.name}`);
        }
    }
};