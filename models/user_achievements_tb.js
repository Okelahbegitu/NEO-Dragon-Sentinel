
const { DataTypes } = require('sequelize');
const sequelize = require('../database');


const UserAchievement = sequelize.define('UserAchievement', {
    username_id: {
        type: DataTypes.STRING(50),
        primaryKey: true,
        allowNull: false
    },

    achievement_id: {
        type: DataTypes.STRING(50),
        primaryKey: true,
        allowNull: false
    },

    unlocked_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'user_achievements_tb',
    timestamps: false
});

module.exports = UserAchievement;
