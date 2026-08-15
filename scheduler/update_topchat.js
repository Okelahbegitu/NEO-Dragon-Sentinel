const cron = require("node-cron");
const { Op, where, fn, col, literal } = require("sequelize");
const tb = require("../models/top_chat");


cron.schedule("0 0 1 * *", async () => {
    try {
        await tb.update(
            { amount: 0 },
            { where: {} }
        );
    }
    catch (err) {
        console.error("[SCHEDULER] Failed to reset top chat:", err.message);
    }
});