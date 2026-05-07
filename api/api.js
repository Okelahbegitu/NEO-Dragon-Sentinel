const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const express = require('express');
const cors = require('cors');
const client = require('../index');


const app = express();

app.use(cors());
app.use(express.json());

app.get('/members/:guildId/:userId', async (req, res) => {
  try {
    const { guildId, userId } = req.params;

    if (!client.isReady() || !client.token) {
      return res.status(503).json({
        error: 'Bot belum login. Pastikan DISCORD_TOKEN ada dan valid.',
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
      roles: member.roles.cache.map((role) => ({
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

app.listen(3001, () => {
  console.log('API is running on http://localhost:3001');
});