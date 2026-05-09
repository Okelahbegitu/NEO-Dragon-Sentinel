/**
 * Centralized environment configuration
 * Load dotenv in development, use system env vars in production
 */

require('dotenv').config();

module.exports = {
    // Discord
    DISCORD_TOKEN: process.env.DISCORD_TOKEN,
    CLIENT_ID: process.env.CLIENT_ID,
    GUILD_ID: process.env.GUILD_ID,

    // MongoDB
    MONGO_URI: process.env.MONGO_URI || "mongodb://127.0.0.1:27017/testdb",

    // MySQL Database
    DB_HOST: process.env.DB_SERVER || process.env.DB_HOST || "localhost",
    DB_USER: process.env.DB_USER || "root",
    DB_NAME: process.env.DB_NAME,
    DB_PASSWORD: process.env.DB_PASS || process.env.DB_PASSWORD || "",
    DB_PORT: process.env.DB_PORT || 3306,

    // API Keys
    TOTAL_VIRUS_KEY: process.env.TOTAL_VIRUS_KEY,

    /**
     * Validation helper
     */
    validate() {
        const required = ['DISCORD_TOKEN', 'CLIENT_ID', 'DB_NAME'];
        const missing = required.filter(key => !this[key]);

        if (missing.length > 0) {
            throw new Error(`Missing required env vars: ${missing.join(', ')}`);
        }
    }
};
