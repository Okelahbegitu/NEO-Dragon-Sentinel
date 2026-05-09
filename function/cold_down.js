const cooldowns = new Map();
const config = require("../models/config_tb");

async function setCooldown(user_id, command_name) {
    // Retrieve the cooldown duration from the database or config
    const cooldownDuration = await config.findOne({ where: { key_name: "command_cooldown", status: "active" } }).
    then(result => result ? result.value : null);
    const duration = cooldownDuration ? parseInt(cooldownDuration) : 3000; // Default 3 detik
    if (!cooldowns.has(command_name)) {
        cooldowns.set(command_name, new Map());
    }

    cooldowns.get(command_name).set(user_id, Date.now() + duration);
}

function isOnCooldown(user_id, command_name) {
    if (!cooldowns.has(command_name)) return false;

    const userCooldowns = cooldowns.get(command_name);
    if (!userCooldowns.has(user_id)) return false;

    const expiresAt = userCooldowns.get(user_id);
    if (Date.now() > expiresAt) {
        userCooldowns.delete(user_id);
        return false;
    }

    return true;
}

function getCooldownRemaining(user_id, command_name) {
    if (!cooldowns.has(command_name)) return 0;

    const userCooldowns = cooldowns.get(command_name);
    if (!userCooldowns.has(user_id)) return 0;

    const expiresAt = userCooldowns.get(user_id);
    const remaining = expiresAt - Date.now();

    if (remaining <= 0) {
        userCooldowns.delete(user_id);
        return 0;
    }

    return remaining;
}

module.exports = {
    setCooldown,
    isOnCooldown,
    getCooldownRemaining,
};