const { Sequelize, DataTypes } = require('sequelize');
require('dotenv').config();

module.exports = new Sequelize('Skb_Attendance', 'postgres', process.env.DB_PASSWORD, {
    host: 'localhost',
    dialect: 'postgres',
    schema: 'skb',
    logging: false
});
