const level_tb = require("../models/level_tb");
async function add_xp(userOrMember, gain_xp) {
    try {
        const user = userOrMember.user ?? userOrMember;
        const member = userOrMember.roles ? userOrMember : null;

        const [user_level_data] = await level_tb.findOrCreate({ where: { username_id: user.id }, defaults: { username_id: user.id, level: 1, xp: 0 } });
        user_level_data.xp += gain_xp;

        let max_xp = 50 * user_level_data.level ** 2;

        if (gain_xp > 0) {
            while (user_level_data.xp >= max_xp) {
                user_level_data.xp -= max_xp;
                user_level_data.level++;
                max_xp = 50 * user_level_data.level ** 2;

                //kasih role sesuai level

                if (member) {
                    if (user_level_data.level >= 100) {
                        await member.roles.add("1032920319113052161").catch(() => null);
                    } else if (user_level_data.level >= 75) {
                        await member.roles.add("1487271663413231737").catch(() => null);
                    } else if (user_level_data.level >= 50) {
                        await member.roles.add("1487271507938775200").catch(() => null);
                    } else if (user_level_data.level >= 25) {
                        await member.roles.add("1487271274597191851").catch(() => null);
                    } else if (user_level_data.level >= 5) {
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
                        await member.roles.remove("1032920319113052161").catch(() => null);
                    }

                    if (user_level_data.level < 75) {
                        await member.roles.remove("1487271663413231737").catch(() => null);
                    }

                    if (user_level_data.level < 50) {
                        await member.roles.remove("1487271507938775200").catch(() => null);
                    }

                    if (user_level_data.level < 25) {
                        await member.roles.remove("1487271274597191851").catch(() => null);
                    }

                    if (user_level_data.level < 5) {
                        await member.roles.remove("1487271116102701229").catch(() => null);
                    }
                }

            }
            if (user_level_data.xp < 0) {
                user_level_data.xp = 0;
            }


        }


        await user_level_data.save();
    } catch (error) {
        console.error("Error adding XP:", error);
    }
}

module.exports = add_xp;