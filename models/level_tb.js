const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const level_tb = sequelize.define('level_tb', {
    username_id: {
        type: DataTypes.STRING(50),
        allowNull: false,
        primaryKey: true
    },
    level: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1
    },
    xp: {
        type: DataTypes.BIGINT,
        allowNull: false,
        defaultValue: 0
    }
},
{
    tableName: 'level_tb',
    timestamps: false
}
);

module.exports = level_tb;