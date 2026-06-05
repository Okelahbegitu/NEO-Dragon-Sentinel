const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const target_donation = sequelize.define('target_donation_tb', {
    id: {
        type: DataTypes.STRING(50),
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT
    },
    goal_amount: {
        type: DataTypes.BIGINT,
        allowNull: false
    },
    current_amount: {
        type: DataTypes.BIGINT,
        defaultValue: 0
    },
    status: {
        type: DataTypes.ENUM('reached', 'unreached', 'removed'),
        defaultValue: 'unreached'
    }
    , created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }

},
    {
        tableName: 'target_donation_tb',
        timestamps: false
    });


module.exports = target_donation;