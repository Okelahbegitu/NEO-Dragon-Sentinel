const cron = require("node-cron");
const { Op, fn, col, literal } = require("sequelize");
const tb = require("../models/crime_note_members_tb");

cron.schedule("0 0 * * *", async () => {
    try {
        const [updatedCount] = await tb.update(
            { status: "inactive" },
            {
                where: {
                    status: "active",
                    [Op.and]: [
                        where(
                            fn("DATE", col("date")),
                            {
                                [Op.lte]: literal(
                                    "DATE_SUB(CURDATE(), INTERVAL 7 DAY)"
                                )
                            }
                        )
                    ]
                }
            }
        );

        console.log(
            `[SCHEDULER] ${updatedCount} crime notes have been expired.`
        );
    } catch (err) {
        console.error(
            "[SCHEDULER] Failed to expire crime notes:",
            err.message
        );
    }
});