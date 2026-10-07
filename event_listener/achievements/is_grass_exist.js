const { Events } = require("discord.js");
const achievementTable = require('../../models/user_achievements_tb');
const ACHIEVEMENT_ID = 4;
const ACHIEVEMENT_INTERVAL_MS = 7 * 24 * 60 * 60 * 1000;
const TICK_MS = 60 * 1000;
const MIN_NON_BOT_MEMBERS = 1;
const ALLOW_SELF_DEAFENED = true;

const voiceUsers = new Map();
let voiceAchievementInterval = null;

async function processVoiceAchievement(client) {
    const now = Date.now();

    for (const [userId, userData] of voiceUsers.entries()) {
        if (now - userData.joinedAt < ACHIEVEMENT_INTERVAL_MS) continue;

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

        if (!ALLOW_SELF_DEAFENED && member.voice.selfDeaf) {
            continue;
        }

        const nonBotMembers = member.voice.channel.members.filter((m) => !m.user.bot);
        if (nonBotMembers.size < MIN_NON_BOT_MEMBERS) continue;

        const [achievement, created] = await achievementTable.findOrCreate({
            where: {
                username_id: userId,
                achievement_id: ACHIEVEMENT_ID
            },
            defaults: {
                username_id: userId,
                achievement_id: ACHIEVEMENT_ID
            }
        });

        voiceUsers.delete(userId);
        console.log(
            created
                ? `User ${member.user.username} unlocked achievement ${ACHIEVEMENT_ID}`
                : `User ${member.user.username} already has achievement ${ACHIEVEMENT_ID}`
        );
    }
}

function ensureVoiceAchievementInterval(client) {
    if (voiceAchievementInterval) return;

    voiceAchievementInterval = setInterval(() => {
        processVoiceAchievement(client).catch((error) => {
            console.error("Error processing achievement:", error);
        });
    }, TICK_MS);
}

module.exports = {
    name: Events.VoiceStateUpdate,
    async execute(oldState, newState) {
        if (!newState.guild || !newState.member || newState.member.user.bot) return;

        ensureVoiceAchievementInterval(newState.client);

        const userId = newState.id;
        const oldChannelId = oldState.channelId;
        const newChannelId = newState.channelId;

        if (oldChannelId === null && newChannelId !== null) {
            voiceUsers.set(userId, {
                joinedAt: Date.now(),
                guildId: newState.guild.id
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
                guildId: newState.guild.id
            });
            console.log(`User ${newState.member.user.username} moved voice channel to ${newState.channel.name}`);
        }
    }
};