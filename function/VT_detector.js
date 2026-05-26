const axios = require('axios');
const env = require('../config/env');

const normalizeUrl =
    require('../function/normalize_url');

const getHostname =
    require('../function/get_hostname');

const trustedDomains =
    require('../function/domain_whitelist');

async function vt_detector(message, urlsToCheck) {

    for (const rawUrl of urlsToCheck) {

        const normalizedUrl =
            normalizeUrl(rawUrl);

        if (!normalizedUrl) continue;

        const hostname =
            getHostname(normalizedUrl);

        if (!hostname) continue;

        // skip trusted domain
        if (
            trustedDomains.includes(hostname)
        ) {
            continue;
        }

        const response = await axios.post(
            'https://www.virustotal.com/api/v3/urls',
            new URLSearchParams({
                url: normalizedUrl
            }).toString(),
            {
                headers: {
                    accept: 'application/json',
                    'content-type':
                        'application/x-www-form-urlencoded',
                    'x-apikey':
                        env.TOTAL_VIRUS_KEY,
                },
            }
        );

        const id = response.data.data.id;

        await new Promise(resolve =>
            setTimeout(resolve, 1000)
        );

        const analysisResponse =
            await axios.get(
                `https://www.virustotal.com/api/v3/analyses/${id}`,
                {
                    headers: {
                        accept: 'application/json',
                        'x-apikey':
                            env.TOTAL_VIRUS_KEY,
                    },
                }
            );

        const stats =
            analysisResponse.data.data
                .attributes.stats;


        if (stats.suspicious > 0) {

            return {
                score: 5 * stats.suspicious,
                reason: ['VT suspicious'],
                url: normalizedUrl
            };
        }
    }

    return {
        score: 0,
        reason: []
    };
}

module.exports = vt_detector;