const getHostname =
    require('../function/get_hostname');

const redflagTlds = [
    '.xyz',
    '.top',
    '.club',
    '.online',
    '.site',
    '.website',
    '.space',
    '.tech',
    '.store',
    '.info',
    '.biz',
    '.io',
    'vercel.app',
    'netlify.app',
    'suspicos.com',
    'suspicos.net',
    'suspicos.org'
];

function tld_detector(urls) {

    let totalScore = 0;
    const reasons = [];

    for (const url of urls) {

        const hostname =
            getHostname(url);

        if (!hostname) continue;

        for (const tld of redflagTlds) {

            if (hostname.endsWith(tld)) {

                totalScore += 2;

                reasons.push(
                    `Suspicious TLD: ${tld}`
                );

                break;
            }
        }
    }

    return {
        score: totalScore,
        reasons
    };
}

module.exports = tld_detector;