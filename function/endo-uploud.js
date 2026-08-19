const client = require('../index');
const axios = require('axios');

async function notifEndoUploud(EndoChannel, link, videoId) {
  const channelId = '1500757795685798061';

  try {
    const channel = await client.channels.fetch(channelId);
    const roleId = '1492174556440432801';
    let text = ``

    const res = await axios.get(`https://www.youtube.com/watch?v=${videoId}`);
    const html = res.data;



    // YouTube menyisipkan metadata "isLiveBroadcast" pada HTML halaman video yang sedang Live
    if (html.includes('"isLiveBroadcast":true') || html.includes('isLive":true')) {
      text = `Attention, <@&${roleId}> — **${EndoChannel}** will commence a live transmission shortly. \n ${link}`;
    } else if (html.includes('"isLiveContent":true')) {
      text = `Attention, <@&${roleId}> — **${EndoChannel}** will commence a live transmission shortly. \n ${link}`;

    } else {
      text = `Attention, <@&${roleId}> — **${EndoChannel}** has issued a new transmission. \n ${link}`;
    }


    if (!channel?.isTextBased()) {
      throw new Error('Channel tujuan bukan text-based channel.');
    }

    await channel.send(
      text
    );
  } catch (error) {
    console.error('Gagal mengirim notifikasi upload:', error);
  }
}

module.exports = notifEndoUploud;

