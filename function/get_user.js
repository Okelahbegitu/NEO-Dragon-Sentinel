const client = require("../index");

function get_user(user_id) {
    const guild = client.guilds.cache.get("SERVER_ID");
    const member = guild.members.cache.get(user_id);
    return member; 
}

module.exports = get_user;