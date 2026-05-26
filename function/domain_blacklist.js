const blacklist_domain = [
    'dlscord.com',
    'discord-airdrop.com',
    'discordgift.com',
    'discord-gift.com',
    'discord-gifts.com',
    'discordgiftcard.com',
    'discordgiftcards.com',
    'discord-nitro.com',
    'discord-nitro-gift.com',
    'free-robux.com',
    'free-robux.net',
    'free-robux.org',
    'free-robux.info',
    'free-robux.co',
    'free-robux.io',
    'free-robux.xyz',
];

function is_blacklisted(hostname) {
    let score = 0;
    for (const host of hostname){
        if (blacklist_domain.includes(host)) {
            score += 5;
        }
    }
    return score;
}

module.exports = is_blacklisted;