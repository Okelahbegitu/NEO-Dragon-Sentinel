const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const top_chat = sequelize.define('top_chat_tb', {
    id_user: {
        type: DataTypes.STRING(50),
        primaryKey: true
    },
    amount: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
},{
    tableName: 'top_chat_tb',
    timestamps: false
})

module.exports = top_chat;