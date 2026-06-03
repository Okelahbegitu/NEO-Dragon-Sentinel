const path = require('path');
const multer = require('multer');
const nsfwjs = require('nsfwjs');
const tf = require("@tensorflow/tfjs");
const fs = require("fs");
const sharp = require("sharp");
const env = require('../config/env');


require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const express = require('express');
const cors = require('cors');
const client = require('../index');


const app = express();
const upload = multer({ dest: "uploads/" });
let model;

(async () => {
  console.log('Loading NSFW model...');
  model = await nsfwjs.load();
  console.log('NSFW model loaded');
})();

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

app.post("/scan", upload.single("image"), async (req, res) => {
  let imageTensor;

  try {
    if (!model) {
      return res.status(503).json({ error: 'Model NSFW belum siap. Coba lagi nanti.' });
    }
    if (!req.file) {
      return res.status(400).json({
        error: 'Image tidak ditemukan'
      });
    }
    if (req.file.mimetype === "image/gif") {
      return res.status(400).json({
        error: "GIF tidak didukung"
      });
    }


    try {
      const { data, info } = await sharp(req.file.path)
        .rotate()
        .removeAlpha()
        .toColourspace('srgb')
        .raw()
        .toBuffer({ resolveWithObject: true });

      imageTensor = tf.tensor3d(
        data,
        [info.height, info.width, info.channels],
        'float32'
      );

      const expanded = imageTensor.expandDims(0);
      const predictions = await model.classify(expanded);
      expanded.dispose();

      return res.json({
        status: 'success',
        predictions
      });

    } catch (error) {
      return res.status(400).json({ error: 'Gagal memproses gambar. Pastikan file yang diunggah adalah gambar yang valid.', details: error.message });
    }
  }
  catch (error) {
    return res.status(500).json({ error: error.message });
  } finally {
    if (imageTensor) {
      imageTensor.dispose();
    }

    if (req.file?.path) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (unlinkError) {
        console.error('Gagal menghapus file upload sementara:', unlinkError.message);
      }
    }
  }
});

app.listen(env.EXPRESS_PORT, () => {
  console.log(`API is running on http://localhost:${env.EXPRESS_PORT}`);
});