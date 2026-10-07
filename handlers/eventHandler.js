const fs = require("fs");
const path = require("path");

module.exports = (client) => {
    const eventsPath = path.join(__dirname, "../event_listener");

    function loadEvents(folderPath) {
        const files = fs.readdirSync(folderPath);

        for (const file of files) {
            const filePath = path.join(folderPath, file);
            const stat = fs.statSync(filePath);

            if (stat.isDirectory()) {
                loadEvents(filePath);
                continue;
            }

            if (!file.endsWith(".js")) continue;

            const event = require(filePath);

            if (event.name) {
                client.on(event.name, (...args) => event.execute(...args));
            }
            console.log(`Loaded event: ${filePath}`);
        }
    }

    loadEvents(eventsPath);
};