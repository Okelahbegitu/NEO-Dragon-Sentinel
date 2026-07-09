const cron = require("node-cron");
const { Op, where, fn, col, literal } = require("sequelize");
const tb = require("../models/crime_note_members_tb");

cron.schedule("0 0 * * *", async () => {
    try {
        await tb.update(
            { status: "expired" },
            {
                where: {
                    status: "active",
                    [Op.and]: [
                        where(
                            fn("DATE", fn("DATE_ADD", col("date"), literal("INTERVAL 7 DAY"))),
                            fn("CURDATE")
                        )
                    ]
                }
            }
        );
    } catch (err) {
        console.error("[SCHEDULER] Failed to expire crime notes:", err.message);
    }
});