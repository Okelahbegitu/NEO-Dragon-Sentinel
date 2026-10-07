
const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const Achievement = sequelize.define('Achievement', {
    id_achievement: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true
    },
    name: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    tableName: 'achievements_tb',
    timestamps: false
});

module.exports = Achievement;
