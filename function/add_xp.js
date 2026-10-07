const level_tb = require("../models/level_tb");
const achievement_table = require("../models/user_achievements_tb");

const levelRewards = [
    { level: 5, roleId: "1487271116102701229", achievementId: 7 },
    { level: 25, roleId: "1487271274597191851", achievementId: 8 },
    { level: 50, roleId: "1487271507938775200", achievementId: 9 },
    { level: 75, roleId: "1487271663413231737", achievementId: 10 },
    { level: 100, roleId: "1032920319113052161", achievementId: 11 },
];

async function unlockAchievement(userId, achievementId) {
    try {
        const [, created] = await achievement_table.findOrCreate({
            where: {
                username_id: userId,
                achievement_id: achievementId,
            },
            defaults: {
                username_id: userId,
                achievement_id: achievementId,
            },
        });

        if (created) {
            console.log(`Achievement ${achievementId} berhasil ditambahkan untuk ID: ${userId}`);
        }
    } catch (error) {
        console.error(`Terjadi kesalahan saat menambahkan achievement ${achievementId} untuk ID: ${userId}`, error);
    }
}

async function add_xp(userOrMember, gain_xp, client = null) {
    try {
        const user = userOrMember.user ?? userOrMember;
        const member = userOrMember.roles ? userOrMember : null;

        const [user_level_data] = await level_tb.findOrCreate({ where: { username_id: user.id }, defaults: { username_id: user.id, level: 1, xp: 0 } });
        const previousLevel = user_level_data.level;
        user_level_data.xp += gain_xp;
        let levelUps = 0;

        let max_xp = 50 * user_level_data.level ** 2;

        if (gain_xp > 0) {
            while (user_level_data.xp >= max_xp) {
                user_level_data.xp -= max_xp;
                user_level_data.level++;
                levelUps += 1;
                max_xp = 50 * user_level_data.level ** 2;

                if (member) {
                    const reward = levelRewards.find(({ level }) => level === user_level_data.level);
                    if (reward) {
                        console.log(`[add_xp] trying to add role ${reward.roleId} to ${user.id} at level ${user_level_data.level}`);
                        await member.roles.add(reward.roleId).catch(() => null);
                        await unlockAchievement(user.id, reward.achievementId);
                    }
                }
            }
        } else if (gain_xp < 0) {
            while (user_level_data.xp < 0 && user_level_data.level > 1) {
                user_level_data.level--;
                max_xp = 50 * user_level_data.level ** 2;
                user_level_data.xp += max_xp;


                if (member) {
                    for (const reward of levelRewards) {
                        if (user_level_data.level < reward.level) {
                            console.log(`[add_xp] trying to remove role ${reward.roleId} from ${user.id} at level ${user_level_data.level}`);
                            await member.roles.remove(reward.roleId).catch(() => null);
                        }
                    }
                }

            }
            if (user_level_data.xp < 0) {
                user_level_data.xp = 0;
            }


        }


        await user_level_data.save();

        if (client && levelUps > 0) {
            client.channels.fetch("1033321345037123604").then((channel) => {
                if (!channel?.send) return;

                channel.send(`🎉 <@${user.id}> naik ${levelUps} level dan sekarang level ${user_level_data.level}!`);
            }).catch((err) => {
                console.error("Error fetching channel for level up announcement:", err);
            });
        }

        return {
            user_level_data,
            leveledUp: levelUps > 0,
            levelUps,
            previousLevel,
        };
    } catch (error) {
        console.error("Error adding XP:", error);
        return null;
    }
}

module.exports = add_xp;