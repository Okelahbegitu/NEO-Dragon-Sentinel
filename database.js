const env = require('./config/env');
const { Sequelize } = require('sequelize');

env.validate();

const sequelize = new Sequelize(
    env.DB_NAME,
    env.DB_USER,
    env.DB_PASSWORD,
    {
        host: env.DB_HOST,
        port: env.DB_PORT,
        dialect: 'mysql',
    }
);

(async () => {
    try {
        await sequelize.authenticate();
        console.log('MySQL connected');
    } catch (err) {
        console.error('MySQL connection failed:', err);
    }
})();

module.exports = sequelize;