const axios = require("axios");
const env = require("./config/env");

const WEBHOOK_URL = env.ERROR_WEBHOOK;
const DEV_ID = env.DEVELOPER_ID;

async function sendCrashReport(error, type) {
    try {
        const errorText =
            error?.stack ||
            error?.message ||
            String(error);

        await axios.post(WEBHOOK_URL
            ,
            {
                content: `<@${DEV_ID}> Bot mengalami error: ${type}`,
                allowed_mentions: {
                    users: [DEV_ID]
                },

                embeds: [
                    {
                        title: "Bot Alert!",
                        color: 5793266,

                        author: {
                            name: "Ender Alarm"
                        },

                        timestamp: new Date().toISOString(),

                        fields: [
                            {
                                name: "Error Type",
                                value: type,
                                inline: false
                            },
                            {
                                name: "Error Details",
                                value:
                                    "```js\n" +
                                    errorText.slice(0, 900) +
                                    "\n```",
                                inline: false
                            }
                        ]
                    }
                ]
            },
            {
                timeout: 5000
            }
        );
    } catch (webhookError) {
        console.error(
            "Gagal mengirim crash report:",
            webhookError.message
        );
    }
}

process.on("uncaughtException", async (err) => {
    console.error("[UNCAUGHT EXCEPTION]", err);

    await sendCrashReport(
        err,
        "Uncaught Exception"
    );

    process.exit(1);
});

process.on("unhandledRejection", async (reason) => {
    console.error("[UNHANDLED REJECTION]", reason);

    await sendCrashReport(
        reason,
        "Unhandled Rejection"
    );

    process.exit(1);
});
