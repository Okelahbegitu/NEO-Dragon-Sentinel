const axios = require('axios');
const sharp = require('sharp');

function escapeXml(text) {
    return String(text)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
}

function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

function encodeDataUrl(buffer, mimeType) {
    return `data:${mimeType};base64,${buffer.toString('base64')}`;
}

async function fetchImageDataUrl(url, fallbackColor = '#6B7280') {
    if (!url) {
        return null;
    }

    try {
        const response = await axios.get(url, { responseType: 'arraybuffer', timeout: 10000 });
        const mimeType = response.headers['content-type'] || 'image/png';
        return encodeDataUrl(Buffer.from(response.data), mimeType);
    } catch (error) {
        const fallbackSvg = `
            <svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128">
                <rect width="128" height="128" rx="64" fill="${fallbackColor}" />
            </svg>
        `;

        return `data:image/svg+xml;base64,${Buffer.from(fallbackSvg).toString('base64')}`;
    }
}

async function renderLevelCard({ username, level, xp, maxXp, progress }) {
    const safeUsername = escapeXml(username);
    const safeLevel = escapeXml(level);
    const safeXp = escapeXml(xp);
    const safeMaxXp = escapeXml(maxXp);
    const clampedProgress = clamp(Number(progress) || 0, 0, 100);
    const progressWidth = Math.round((560 * clampedProgress) / 100);

    const svg = `
        <svg xmlns="http://www.w3.org/2000/svg" width="800" height="240" viewBox="0 0 800 240">
            <defs>
                <linearGradient id="background" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stop-color="#2e1065" />
                    <stop offset="100%" stop-color="#3b0764" />
                </linearGradient>
                <linearGradient id="progress" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stop-color="#c084fc" />
                    <stop offset="100%" stop-color="#a855f7" />
                </linearGradient>
                <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="0" dy="10" stdDeviation="12" flood-color="#000000" flood-opacity="0.25" />
                </filter>
            </defs>

            <rect width="800" height="240" rx="22" fill="url(#background)" filter="url(#shadow)" />
            <circle cx="715" cy="55" r="100" fill="#8b5cf6" opacity="0.12" />
            <circle cx="100" cy="210" r="90" fill="#c084fc" opacity="0.1" />

            <text x="40" y="72" fill="#ffffff" font-family="Arial, sans-serif" font-size="34" font-weight="700">${safeUsername}</text>
            <text x="40" y="118" fill="#ffffff" font-family="Arial, sans-serif" font-size="24" font-weight="600">Level ${safeLevel}</text>

            <text x="40" y="166" fill="#e5e7eb" font-family="Arial, sans-serif" font-size="18" font-weight="600">Progress</text>
            <rect x="40" y="178" width="560" height="30" rx="15" fill="#cffafe" opacity="0.95" />
            <rect x="40" y="178" width="${progressWidth}" height="30" rx="15" fill="url(#progress)" />
            <text x="620" y="200" fill="#ffffff" font-family="Arial, sans-serif" font-size="20" font-weight="700">${clampedProgress}%</text>

            <text x="760" y="182" text-anchor="end" fill="#ffffff" font-family="Arial, sans-serif" font-size="20" font-weight="600">${safeXp} / ${safeMaxXp} XP</text>
        </svg>
    `;

    return sharp(Buffer.from(svg)).png().toBuffer();
}

async function renderLeaderboardCard({ title = 'Leaderboard Level', rows }) {
    const normalizedRows = Array.isArray(rows) ? rows.slice(0, 10) : [];
    const rowHeight = 104;
    const width = 1100;
    const headerHeight = 130;
    const height = headerHeight + (normalizedRows.length * rowHeight) + 30;
    const startY = 150;

    const rowMarkup = normalizedRows.map((row, index) => {
        const rank = index + 1;
        const baseY = startY + (index * rowHeight);
        const isGold = rank === 1;
        const isSilver = rank === 2;
        const isBronze = rank === 3;
        const cardColor = isGold ? '#F2C94C' : isSilver ? '#B8B8C8' : isBronze ? '#B87333' : '#4A0B5C';
        const shadowColor = isGold ? '#D6A51A' : isSilver ? '#8E8E9B' : isBronze ? '#8B5324' : '#5B1370';
        const textColor = isGold ? '#1A1020' : isSilver ? '#15151A' : isBronze ? '#1A0F08' : '#F5EFFF';
        const subtextColor = isGold ? '#4A3A00' : isSilver ? '#4B4B5A' : isBronze ? '#3A2410' : '#BFA7D8';
        const avatarMarkup = row.avatarUrl ? `<image href="${row.avatarUrl}" x="58" y="${baseY + 20}" width="64" height="64" clip-path="url(#avatarClip${rank})" />` : '';

        return `
            <defs>
                <clipPath id="avatarClip${rank}">
                    <circle cx="90" cy="${baseY + 52}" r="32" />
                </clipPath>
            </defs>
            <g>
                <rect x="35" y="${baseY}" width="1030" height="90" rx="18" fill="${cardColor}" stroke="${shadowColor}" stroke-width="2" />
                <circle cx="90" cy="${baseY + 52}" r="34" fill="#15151A" opacity="0.25" />
                ${avatarMarkup}
                <circle cx="90" cy="${baseY + 52}" r="32" fill="none" stroke="rgba(255,255,255,0.18)" stroke-width="2" />
                <text x="145" y="${baseY + 48}" fill="${textColor}" font-family="Arial, sans-serif" font-size="22" font-weight="700">${escapeXml(row.displayName || 'Unknown')}</text>
                <text x="145" y="${baseY + 73}" fill="${subtextColor}" font-family="Arial, sans-serif" font-size="18" font-weight="600">Level ${escapeXml(row.level ?? 0)}</text>
                <text x="1010" y="${baseY + 58}" text-anchor="end" fill="${textColor}" font-family="Arial, sans-serif" font-size="30" font-weight="700">#${rank}</text>
            </g>
        `;
    }).join('\n');

    const svg = `
        <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
            <defs>
                <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stop-color="#22002E" />
                    <stop offset="100%" stop-color="#16001F" />
                </linearGradient>
                <filter id="titleShadow" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="0" dy="6" stdDeviation="8" flood-color="#000000" flood-opacity="0.24" />
                </filter>
            </defs>

            <rect width="${width}" height="${height}" fill="url(#bg)" />
            <circle cx="1000" cy="90" r="150" fill="#8b5cf6" opacity="0.08" />
            <circle cx="120" cy="${height - 70}" r="120" fill="#c084fc" opacity="0.06" />

            <text x="${width / 2}" y="70" text-anchor="middle" fill="#ffffff" font-family="Arial, sans-serif" font-size="54" font-weight="800" filter="url(#titleShadow)">${escapeXml(title)}</text>
            <text x="${width / 2}" y="105" text-anchor="middle" fill="#d8b4fe" font-family="Arial, sans-serif" font-size="20" font-weight="600">Top 10 member berdasarkan level dan XP</text>
            ${rowMarkup}
        </svg>
    `;

    return sharp(Buffer.from(svg)).png().toBuffer();
}

async function prepareLeaderboardRows(interaction, userLevelData) {
    const rows = [];

    for (let index = 0; index < 10; index += 1) {
        const userData = userLevelData[index];

        if (!userData) {
            rows.push({
                displayName: '-',
                level: 0,
                avatarUrl: null,
            });
            continue;
        }

        const member = await interaction.guild.members.fetch(userData.username_id).catch(() => null);
        const displayName = member?.displayName ?? member?.user?.globalName ?? member?.user?.username ?? 'Unknown';
        const avatarUrl = member?.displayAvatarURL?.({ extension: 'png', size: 128 }) ?? 'https://via.placeholder.com/128';

        rows.push({
            displayName,
            level: userData.level,
            avatarUrl: await fetchImageDataUrl(avatarUrl),
        });
    }

    return rows;
}

module.exports = {
    renderLevelCard,
    renderLeaderboardCard,
    prepareLeaderboardRows,
};