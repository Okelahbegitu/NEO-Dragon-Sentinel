const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const config_tb = sequelize.define('config_tb', {
    key_name: {
        type: DataTypes.STRING(50),
        allowNull: false,
        primaryKey: true
    },
    value: {
        type: DataTypes.STRING(50),
        allowNull: true
    },
    status: {
        type: DataTypes.ENUM('active', 'inactive'),
        defaultValue: 'active'
    }
}, {
    tableName: 'config_tb',
    timestamps: false
})

module.exports = config_tb;