const express = require('express');
const client = require('../../index');

const router = express.Router();

router.get('/members/:guildId/:userId', async (req, res) => {
    try {
        const { guildId, userId } = req.params;

        if (!client.isReady() || !client.token) {
            return res.status(503).json({
                error: 'Bot belum login.',
            });
        }

        const guild = await client.guilds.fetch(guildId);
        const member = await guild.members.fetch(userId);

        return res.json({
            id: member.id,
            username: member.user.username,
            globalName: member.user.globalName,
            tag: member.user.tag,
            bot: member.user.bot,
            displayName: member.displayName,

            roles: member.roles.cache.map(role => ({
                id: role.id,
                name: role.name,
            })),
        });

    } catch (error) {
        return res.status(500).json({
            error: error.message,
        });
    }
});

//ambil semua channel (text)
router.get('/guilds/:guildId/txt-channels', async (req, res) => {
    try {
        const { guildId } = req.params;
        client.guilds.fetch(guildId).then(guild => {
            const channels = guild.channels.cache.filter(channel => channel.type === 0).map(channel => ({
                id: channel.id,
                name: channel.name,
            }));
            return res.json(channels);
        }
        )
    }catch (error) {
        return res.status(500).json({
            error: error.message,
        });
    }
})

module.exports = router;