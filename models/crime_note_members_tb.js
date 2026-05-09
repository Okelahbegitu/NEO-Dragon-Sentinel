const { DataTypes } = require('sequelize');
const sequelize = require('../database');
const { generateUniqueId } = require("../function/id_maker");


const crime_note_members_tb = sequelize.define('crime_note_member_tb', {
    username_id: {
        type: DataTypes.STRING(50),
        allowNull: false,
    },
    id_note: {
        type: DataTypes.TEXT,
        allowNull: true,
        primaryKey: true,
        defaultValue: () => generateUniqueId(16)
    },
    date: {
        type: DataTypes.DATE(3),
        allowNull: false,
        defaultValue: DataTypes.NOW
    },
    reason: {
        type: DataTypes.TEXT(),
        allowNull: true
    },
    status: {
        type: DataTypes.ENUM('active', 'expired'),
        defaultValue: 'active'
    }
}, {
    tableName: 'crime_note_members_tb',
    timestamps: false
})

module.exports = crime_note_members_tb;