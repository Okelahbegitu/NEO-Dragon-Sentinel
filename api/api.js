const path = require('path');
const multer = require('multer');
const nsfwjs = require('nsfwjs');
const tf = require("@tensorflow/tfjs");
const fs = require("fs");
const sharp = require("sharp");
const env = require('../config/env');

const notif_uploud = require('../function/endo-uploud');
const tacoDonation = require('../function/taco_donation');


const { XMLParser } = require("fast-xml-parser");
const parser = new XMLParser({
    ignoreAttributes: false,   // <- WAJIB false, biar attribute ke-baca
    attributeNamePrefix: "@_", // <- ini yang bikin akses jadi entry.link["@_href"]
});

const alterScan = require('../function/scan_alter');


const crypto = require("crypto");


const target_donation = require('../models/target_donation');


require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const express = require('express');
const cors = require('cors');
const client = require('../index');


const app = express();
const upload = multer({ dest: path.join(__dirname, '..', 'uploads') });
let model;

function removeTempFile(filePath) {
  if (!filePath) return;

  try {
    fs.unlinkSync(filePath);
  } catch (error) {
    console.error('Gagal menghapus file upload sementara:', error.message);
  }
}

function isValidWebhookSignature(payload, signature) {
  if (!signature) {
    return false;
  }

  const expectedSignature = crypto.createHmac('sha256', env.TAKO_WEBTOKEN)
    .update(JSON.stringify(payload))
    .digest('hex');

  const signatureBuffer = Buffer.from(String(signature));
  const expectedBuffer = Buffer.from(expectedSignature);

  return (
    signatureBuffer.length === expectedBuffer.length
    && crypto.timingSafeEqual(signatureBuffer, expectedBuffer)
  );
}

(async () => {
  console.log('Loading NSFW model...');
  model = await nsfwjs.load();
  console.log('NSFW model loaded');
})();

app.use(cors({
  allowedHeaders: [
    'Content-Type',
    'x-tako-signature',
    'bypass-tunnel-reminder',
  ],
}));
app.use(express.json());

app.get('/discord/members/:guildId/:userId', async (req, res) => {
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

    removeTempFile(req.file?.path);
  }
});

app.post('/scan-alter', upload.single("image"), async (req, res) => {
  try {
    await alterScan(req, res);
  }catch (error) {
    console.error('Error in /scan-alter route:', error);
    return res.status(500).json({ error: 'Terjadi kesalahan saat memproses permintaan.', details: error.message });
  }
});

app.post('/webhook/tako', async (req, res) => {
  try {
    console.log('Received taco donation webhook:', req.body);

    const tako_signature = req.headers['x-tako-signature'];

    if (!tako_signature) {
      return res.status(401).json({ error: 'Missing signature' });
    }

    if (!isValidWebhookSignature(req.body, tako_signature)) {
      console.warn('Invalid signature for taco donation webhook');
      return res.status(401).json({ error: 'Invalid signature' });
    }

    await tacoDonation(req.body, client);
    const target_donation_res = await target_donation.findOne({ where: { status: 'unreached' }, order: [['created_at', 'DESC']] });
    if (target_donation_res) {
      target_donation_res.current_amount += req.body.amount;
      console.log(`Updated target donation: ${target_donation_res.current_amount}`);
      if (target_donation_res.current_amount >= target_donation_res.goal_amount) {
        target_donation_res.status = 'reached';
      }

      await target_donation_res.save();
    }

    return res.status(200).json({ message: 'Webhook received' });
  } catch (error) {
    console.error('Failed to handle taco donation webhook:', error);
    return res.status(500).json({ error: 'Failed to handle webhook', details: error.message });
  }
});




// 1. VERIFICATION HANDSHAKE (GET)
app.get("/webhook/youtube", (req, res) => {
  const mode = req.query["hub.mode"];
  const challenge = req.query["hub.challenge"];
  const topic = req.query["hub.topic"];

  console.log(`[WebSub Verification] Mode: ${mode}, Topic: ${topic}`);

  if ((mode === "subscribe" || mode === "unsubscribe") && challenge) {
    // Kunci WebSub: kembalikan hub.challenge dalam bentuk plaintext dan HTTP 200
    return res.status(200).send(challenge);
  }

  return res.sendStatus(400);
});

app.post(
    "/webhook/youtube",
    express.raw({ type: "application/atom+xml" }), // <- ini yang kurang
    async (req, res) => {
        res.sendStatus(200);

        try {
            console.log("=== YOUTUBE NOTIFICATION RECEIVED ===");
            if (!req.body || req.body.length === 0) return;

            // req.body dari express.raw() itu Buffer, wajib di-convert ke string dulu
            const xmlString = req.body.toString("utf-8");
            const jsonObj = parser.parse(xmlString);

            let entries = jsonObj.feed?.entry;
            if (!entries) return;
            if (!Array.isArray(entries)) entries = [entries];

            for (const entry of entries) {
              const channelName = entry.author?.name;
                const videoId = entry["yt:videoId"];
                const title = entry.title;
                const videoUrl = entry.link?.["@_href"];

                console.log("Video Baru Diunggah!");
                console.log(`Judul   : ${title}`);
                console.log(`Channel : ${channelName}`);
                console.log(`Video ID: ${videoId}`);
                console.log(`URL     : ${videoUrl}`);

                notif_uploud(channelName, videoUrl, videoId);
            }
        } catch (err) {
            console.error("Gagal parse notifikasi YouTube:", err);
        }
    }
);







































app.listen(env.EXPRESS_PORT, () => {
  console.log(`API is running on http://localhost:${env.EXPRESS_PORT}`);
});
