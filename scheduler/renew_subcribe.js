const cron = require("node-cron");
const env = require("../config/env");
const axios = require("axios");
const { heading } = require("discord.js");

const id_channel = [
    'hhttps://www.youtube.com/feeds/videos.xml?channel_id=UC3IdTW-A3djepW3tRE0A0nA',
    'https://www.youtube.com/feeds/videos.xml?channel_id=UCGDLULi53SHhIFpWYaKELtg'
]


async function renewSubscribe(channel) {
    const body = new URLSearchParams({
        "hub.mode": "subscribe",
        "hub.topic": channel,
        "hub.callback": `${env.API_URL}/youtube/webhook`,
        "hub.verify": "async"
    });

    const res = await axios.post(
        "https://pubsubhubbub.appspot.com/subscribe",
        body.toString(),
        {
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
        }
    );

    if (res.status === 202) {
        console.log(`Successfully renewed subscription for channel: ${channel}`);
    }
}


cron.schedule("0 3 */3 * *", async () => {
    console.log("Renewing YouTube subscriptions...");
    for (const channel of id_channel) {
        try {
            await renewSubscribe(channel);
        } catch (error) {
            console.error(`Failed to renew subscription for channel: ${channel}`, error);
        }
    }
})