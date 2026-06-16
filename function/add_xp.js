const level_tb = require("../models/level_tb");

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

                //kasih role sesuai level

                if (member) {
                    if (user_level_data.level >= 100) {
                        console.log(`[add_xp] trying to add role 1032920319113052161 to ${user.id} at level ${user_level_data.level}`);
                        await member.roles.add("1032920319113052161").catch(() => null);
                    } else if (user_level_data.level >= 75) {
                        console.log(`[add_xp] trying to add role 1487271663413231737 to ${user.id} at level ${user_level_data.level}`);
                        await member.roles.add("1487271663413231737").catch(() => null);
                    } else if (user_level_data.level >= 50) {
                        console.log(`[add_xp] trying to add role 1487271507938775200 to ${user.id} at level ${user_level_data.level}`);
                        await member.roles.add("1487271507938775200").catch(() => null);
                    } else if (user_level_data.level >= 25) {
                        console.log(`[add_xp] trying to add role 1487271274597191851 to ${user.id} at level ${user_level_data.level}`);
                        await member.roles.add("1487271274597191851").catch(() => null);
                    } else if (user_level_data.level >= 5) {
                        console.log(`[add_xp] trying to add role 1487271116102701229 to ${user.id} at level ${user_level_data.level}`);
                        await member.roles.add("1487271116102701229").catch(() => null);
                    }
                }
            }
        } else if (gain_xp < 0) {
            while (user_level_data.xp < 0 && user_level_data.level > 1) {
                user_level_data.level--;
                max_xp = 50 * user_level_data.level ** 2;
                user_level_data.xp += max_xp;


                if (member) {
                    if (user_level_data.level < 100) {
                        console.log(`[add_xp] trying to remove role 1487271946252193952 from ${user.id} at level ${user_level_data.level}`);
                        await member.roles.remove("1487271946252193952").catch(() => null);
                    }

                    if (user_level_data.level < 75) {
                        console.log(`[add_xp] trying to remove role 1487271663413231737 from ${user.id} at level ${user_level_data.level}`);
                        await member.roles.remove("1487271663413231737").catch(() => null);
                    }

                    if (user_level_data.level < 50) {
                        console.log(`[add_xp] trying to remove role 1487271507938775200 from ${user.id} at level ${user_level_data.level}`);
                        await member.roles.remove("1487271507938775200").catch(() => null);
                    }

                    if (user_level_data.level < 25) {
                        console.log(`[add_xp] trying to remove role 1487271274597191851 from ${user.id} at level ${user_level_data.level}`);
                        await member.roles.remove("1487271274597191851").catch(() => null);
                    }

                    if (user_level_data.level < 5) {
                        console.log(`[add_xp] trying to remove role 1487271116102701229 from ${user.id} at level ${user_level_data.level}`);
                        await member.roles.remove("1487271116102701229").catch(() => null);
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