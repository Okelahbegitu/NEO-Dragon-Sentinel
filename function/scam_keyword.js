const keywords = [
    'free nitro',
    'claim reward',
    'free robux',
    'steam gift',
    'airdrop',
    'maxwin',
    'giveaway',
    'click here',
    'limited time',
    'exclusive offer',
    'depe',
    'gacor',
    'slot',
    'jackpot',
    'win',
    'prize'
];

function keyword_detector(content) {

    const text =
        content.toLowerCase();

    let score = 0;

    const reasons = [];

    for (const keyword of keywords) {

        if (text.includes(keyword)) {

            score += 2;

            reasons.push(
                `Keyword detected: ${keyword}`
            );
        }
    }

    return {
        score,
        reasons
    };
}

module.exports =
    keyword_detector;