const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const perms_admin_troll_tb = sequelize.define('perms_admin_troll_tb', {
    username_id: {
        type: DataTypes.STRING(50),
        allowNull: false,
        primaryKey: true
    },
},{
    tableName: 'perms_admin_troll_tb',
    timestamps: false
})

module.exports = perms_admin_troll_tb;