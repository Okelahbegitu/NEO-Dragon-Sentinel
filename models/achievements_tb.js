
const { DataTypes } = require('sequelize');
const sequelize = require('../database');
const UserAchievement = require('./user_achievements_tb');

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
    }
}, {
    tableName: 'achievements_tb',
    timestamps: false
});

Achievement.hasMany(UserAchievement, {
    foreignKey: 'achievement_id',
    sourceKey: 'id_achievement',
    as: 'userAchievements'
});

UserAchievement.belongsTo(Achievement, {
    foreignKey: 'achievement_id',
    targetKey: 'id_achievement',
    as: 'achievement'
});

module.exports = Achievement;
