const levenshtein = require('fast-levenshtein');
const get_hostname = require('./get_hostname');
const get_root_name = require('./get_root_name');

const protectedDomains = [
    'discord.com',
    'steamcommunity.com',
    'youtube.com',
    'twitter.com',
    'facebook.com',
    'instagram.com',
    'twitch.tv',
    'github.com',
    'gitlab.com',
    'bitbucket.org',
    'linkedin.com',
    'paypal.com',
    'amazon.com',
    'ebay.com',
    'netflix.com',
    'spotify.com',
    'apple.com',
    'microsoft.com',
    'google.com',
    'dropbox.com'
];

function typo_detector(urls) {

    let total_score = 0;
    const reasons = [];
    for (const url of urls) {
        const hostname = get_hostname(url);

        if (!hostname) continue;
        for (const protectedDomain of protectedDomains) {
            const host_name_root = get_root_name(hostname);
            const protected_domain_root = get_root_name(protectedDomain);
            const distance = levenshtein.get(
                host_name_root,
                protected_domain_root
            );
            if (distance > 0 && hostname.length <= 2) {
                if(distance === 1) {
                    total_score += 3;
                } else if (distance === 2) {
                    total_score += 2;
                }
                reasons.push(
                    `Typo detected: ${hostname} (distance: ${distance})`
                );
                break;
            }
        }
    }
    return { total_score, reasons };
}
module.exports = typo_detector;