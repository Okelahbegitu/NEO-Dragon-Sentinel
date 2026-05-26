const { Events, PermissionsBitField } = require("discord.js");
const config = require("../models/config_tb");
const env = require("../config/env");
const axios = require("axios");
const vt_detector = require("../function/VT_detector");
const extractUrls = require("../function/extract_urls");
const normalizeUrl = require("../function/normalize_url");
const getHostname = require("../function/get_hostname");
const isWhitelisted = require("../function/domain_whitelist");
const isBlacklisted = require("../function/domain_blacklist");
const typo_detector = require("../function/typo_detector");
const scam_keyword = require("../function/scam_keyword");
const warn = require("../commands/warn");




module.exports = {
    name: Events.MessageCreate,
    async execute(message) {
        if (message.author.bot) return;
        if (!message.guild) return;
        if (!message.content || message.content.trim() === '') return;
        let total_score = 0;

        const reasons = [];
        const scam_keyword_result = scam_keyword(message.content);


        total_score += scam_keyword_result.score;
        reasons.push(...scam_keyword_result.reasons);

        const urls = extractUrls(message.content);
        if (urls.length === 0) return;

        for (const rawUrl of urls) {
            const normalizedUrl = normalizeUrl(rawUrl);
            if (!normalizedUrl) continue;
            const hostname = getHostname(normalizedUrl);
            if (!hostname) continue;
            if (isWhitelisted(hostname)) continue;

            const blacklist_result = isBlacklisted(hostname);
            if (blacklist_result) {
                total_score += blacklist_result.score;
                reasons.push(...blacklist_result.reasons);
            }
        }

        const typo_detector_result = typo_detector(urls);
        total_score += typo_detector_result.total_score;
        for (const reason of typo_detector_result.reasons) {
            reasons.push(reason);
        }

        try {
            const vt_result = await vt_detector(message, urls);
            total_score += vt_result.score;
            reasons.push(...vt_result.reason);
        } catch (error) {
            console.error(`Error checking URL ${urls}:`, error);
        }

        if(total_score >= 10) {
            //hapus message
            await message.delete();
            //warn user
            warn.giveWarn(message.member, reasons.join('\n'), message.client);
        } if (total_score >= 20) {
            //hapus message
            await message.delete();

            //ban user
            await message.member.ban({ reason: reasons.join('\n') });
        }

    }
}
