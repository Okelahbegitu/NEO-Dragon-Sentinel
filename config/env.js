/**
 * Centralized environment configuration
 * Load dotenv in development, use system env vars in production
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

// Debug log
console.log('[ENV] DB_SERVER:', process.env.DB_SERVER);
console.log('[ENV] DB_USER:', process.env.DB_USER);
console.log('[ENV] DB_NAME:', process.env.DB_NAME);
console.log('[ENV] DB_PORT:', process.env.DB_PORT);

module.exports = {
    // Discord
    DISCORD_TOKEN: process.env.DISCORD_TOKEN,
    CLIENT_ID: process.env.CLIENT_ID,
    GUILD_ID: process.env.GUILD_ID,

    // MySQL Database
    DB_HOST: process.env.DB_SERVER || process.env.DB_HOST || "localhost",
    DB_USER: process.env.DB_USER || "root",
    DB_NAME: process.env.DB_NAME,
    DB_PASSWORD: (process.env.DB_PASS || process.env.DB_PASSWORD || "").trim(),
    DB_PORT: parseInt(process.env.DB_PORT || "3306"),

    // API Keys
    TOTAL_VIRUS_KEY: process.env.TOTAL_VIRUS_KEY,

    EXPRESS_PORT: parseInt(process.env.EXPRESS_PORT || "3001"),
    API_URL: process.env.API_URL || `http://localhost:${process.env.EXPRESS_PORT || 3001}`,

    OWNER_ID : process.env.OWNER_ID || "270503879714537492",

    TAKO_WEBTOKEN: process.env.TAKO_WEBTOKEN,

    /**
     * Validation helper - tidak throw, cuma log warning
     */
    validate() {
        const required = ['DISCORD_TOKEN', 'CLIENT_ID', 'DB_NAME', 'TAKO_WEBTOKEN'];
        const missing = required.filter(key => !this[key]);

        if (missing.length > 0) {
            console.warn(`[ENV] Warning - Missing env vars: ${missing.join(', ')}`);
        }
    }
};
