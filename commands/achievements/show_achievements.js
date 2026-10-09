const fs = require("fs");
const path = require("path");
const sharp = require("sharp");
const {
    ActionRowBuilder,
    AttachmentBuilder,
    ButtonBuilder,
    ButtonStyle
} = require("discord.js");
const achievementTable = require("../../models/achievements_tb");
const userAchievementTable = require("../../models/user_achievements_tb");
const sequelize = require("../../database");

const unlockedPath = path.join(__dirname, "../../assets/achievements/unlocked.svg");
const lockedPath = path.join(__dirname, "../../assets/achievements/locked.svg");
const bgPath = path.join(__dirname, "../../assets/achievements/bg.svg");
const iconsPath = path.join(__dirname, "../../assets/achievements/icons");
const PAGE_SIZE = 3;

function escapeXml(value) {
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&apos;");
}

function wrapText(text, maxLength = 45) {
    const lines = [];
    let currentLine = "";

    for (const word of String(text).split(/\s+/)) {
        const nextLine = currentLine ? `${currentLine} ${word}` : word;
        if (currentLine && nextLine.length > maxLength) {
            lines.push(currentLine);
            currentLine = word;
        } else {
            currentLine = nextLine;
        }
    }

    if (currentLine) lines.push(currentLine);
    return lines;
}

async function createIconOverlay(achievementId) {
    const iconPath = path.join(iconsPath, `${achievementId}.png`);
    if (!fs.existsSync(iconPath)) return null;

    const mask = Buffer.from(
        '<svg width="93" height="93" xmlns="http://www.w3.org/2000/svg"><circle cx="46.5" cy="46.5" r="46.5" fill="white"/></svg>'
    );
    const input = await sharp(iconPath)
        .resize(93, 93, { fit: "cover" })
        .composite([{ input: mask, blend: "dest-in" }])
        .png()
        .toBuffer();

    return { input, left: 74, top: 0 };
}

function generateCard(name, description, icon, yPos, isUnlocked) {
    const lines = wrapText(description);
    const descriptionSvg = lines.map((line, index) => `
        <tspan x="176" dy="${index === 0 ? 0 : 28}">${escapeXml(line)}</tspan>
    `).join("");
    const templatePath = isUnlocked ? unlockedPath : lockedPath;
    const iconToken = isUnlocked ? "{{icon1}}" : "{{icon2}}";
    const nameToken = isUnlocked ? "{{name1}}" : "{{name2}}";
    const descriptionToken = isUnlocked ? "{{description1}}" : "{{description2}}";

    return fs.readFileSync(templatePath, "utf8")
        .replace(iconToken, escapeXml(icon))
        .replace(nameToken, escapeXml(name))
        .replace(descriptionToken, descriptionSvg)
        .replace("{{yPos}}", String(yPos));
}

async function getUserAchievements(usernameId) {
    return achievementTable.findAll({
        attributes: [
            "id_achievement",
            "name",
            "description",
            [
                sequelize.literal(`
                    CASE
                        WHEN userAchievements.achievement_id IS NOT NULL THEN TRUE
                        ELSE FALSE
                    END
                `),
                "isOwned"
            ]
        ],
        include: [{
            model: userAchievementTable,
            as: "userAchievements",
            attributes: ["achievement_id"],
            required: false,
            where: { username_id: usernameId }
        }],
        order: [["id_achievement", "ASC"]]
    });
}

async function renderAchievements(usernameId, index = 0, discordClient) {
    const achievements = await getUserAchievements(usernameId);
    const currentAchievements = achievements.slice(index, index + PAGE_SIZE);
    const username = await discordClient.users.fetch(usernameId)
        .then((user) => user.tag)
        .catch(() => "Unknown User");
    let svg = fs.readFileSync(bgPath, "utf8")
        .replace("{{heading}}", escapeXml(username));

    const cards = currentAchievements.map((achievement, cardIndex) => {
        const data = achievement.dataValues;
        const hasAchievement = Array.isArray(achievement.userAchievements)
            ? achievement.userAchievements.length > 0
            : [true, 1, "1", "true"].includes(data.isOwned);

        return generateCard(
            data.name,
            data.description,
            "",
            25 + cardIndex * 125,
            hasAchievement
        );
    });

    svg = svg.replace("{{data}}", cards.join(""));
    if (!svg.includes("</svg>")) svg += "</svg>";

    const iconOverlays = await Promise.all(currentAchievements.map(async (achievement, cardIndex) => {
        const overlay = await createIconOverlay(achievement.dataValues.id_achievement);
        if (!overlay) return null;

        overlay.top = 120 + cardIndex * 125;
        return overlay;
    }));

    return {
        bgSvg: svg,
        iconOverlays: iconOverlays.filter(Boolean),
        isHasNext: achievements.length > index + PAGE_SIZE,
        isHasPrev: index > 0
    };
}

async function show(interaction) {
    await interaction.deferReply();

    const selectedUser = interaction.options.getUser("user");
    const usernameId = selectedUser?.id ?? interaction.user.id;
    const index = 0;
    const rendered = await renderAchievements(usernameId, index, interaction.client);
    const image = await sharp(Buffer.from(rendered.bgSvg))
        .composite(rendered.iconOverlays)
        .png()
        .toBuffer();
    const attachment = new AttachmentBuilder(image, { name: "achievements.png" });
    const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId(`prev_achievements_${usernameId}_${index - PAGE_SIZE}`)
            .setLabel("⬅️")
            .setStyle(ButtonStyle.Primary)
            .setDisabled(!rendered.isHasPrev),
        new ButtonBuilder()
            .setCustomId(`next_achievements_${usernameId}_${index + PAGE_SIZE}`)
            .setLabel("➡️")
            .setStyle(ButtonStyle.Primary)
            .setDisabled(!rendered.isHasNext)
    );

    await interaction.editReply({ files: [attachment], components: [row] });
}

module.exports = show;
module.exports.renderAchievements = renderAchievements;
