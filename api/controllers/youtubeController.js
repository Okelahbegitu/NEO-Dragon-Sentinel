const { XMLParser } = require('fast-xml-parser');

const notif_uploud = require('../../function/endo-uploud');

const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '@_',
});

function verifyYoutube(req, res) {
    const mode = req.query['hub.mode'];
    const challenge = req.query['hub.challenge'];
    const topic = req.query['hub.topic'];

    console.log(
        `[WebSub Verification] Mode: ${mode}, Topic: ${topic}`
    );

    if (
        (mode === 'subscribe' || mode === 'unsubscribe') &&
        challenge
    ) {
        return res
            .status(200)
            .send(challenge);
    }

    return res.sendStatus(400);
}

async function handleYoutube(req, res) {
    // YouTube WebSub membutuhkan response cepat
    res.sendStatus(200);

    try {
        console.log(
            '=== YOUTUBE NOTIFICATION RECEIVED ==='
        );

        if (
            !req.body ||
            req.body.length === 0
        ) {
            return;
        }

        const xmlString =
            req.body.toString('utf-8');

        const jsonObj =
            parser.parse(xmlString);

        let entries =
            jsonObj.feed?.entry;

        if (!entries) {
            return;
        }

        if (!Array.isArray(entries)) {
            entries = [entries];
        }

        for (const entry of entries) {
            const channelName =
                entry.author?.name;

            const videoId =
                entry['yt:videoId'];

            const title =
                entry.title;

            const videoUrl =
                entry.link?.['@_href'];

            console.log(
                'Video Baru Diunggah!'
            );

            console.log(
                `Judul   : ${title}`
            );

            console.log(
                `Channel : ${channelName}`
            );

            console.log(
                `Video ID: ${videoId}`
            );

            console.log(
                `URL     : ${videoUrl}`
            );

            notif_uploud(
                channelName,
                videoUrl,
                videoId
            );
        }

    } catch (err) {
        console.error(
            'Gagal parse notifikasi YouTube:',
            err
        );
    }
}

module.exports = {
    verifyYoutube,
    handleYoutube
};