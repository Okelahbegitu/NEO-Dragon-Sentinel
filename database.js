const env = require('./config/env');
const { Sequelize } = require('sequelize');

console.log('[DB] Connecting to MySQL:', {
    host: env.DB_HOST,
    user: env.DB_USER,
    database: env.DB_NAME,
    port: env.DB_PORT
});

const sequelize = new Sequelize(
    env.DB_NAME,
    env.DB_USER,
    env.DB_PASSWORD,
    {
        host: env.DB_HOST,
        port: env.DB_PORT,
        dialect: 'mysql',
        logging: false, // Disable query logging
    }
);

(async () => {
    try {
        await sequelize.authenticate();
        console.log('[DB] ✅ MySQL connected successfully');
    } catch (err) {
        console.error('[DB] ❌ MySQL connection failed:', err.message);
        console.error('[DB] Make sure MySQL is running and credentials are correct');
    }
})();

module.exports = sequelize;