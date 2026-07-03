const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const statistic_tb = sequelize.define('statistic_tb', {
    // Define your columns here
    name: {
        type: DataTypes.STRING(50),
        allowNull: false,
        primaryKey: true
    },
    value: {
        type: DataTypes.STRING(50),
        allowNull: false
    }
}, {
    tableName: 'statistic_tb',
    timestamps: false
});

module.exports = statistic_tb;