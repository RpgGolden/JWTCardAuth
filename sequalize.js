const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize('Skb_Attendance', 'postgres', process.env.DB_PASSWORD, {
    host: 'localhost',
    dialect: 'postgres',
    schema: 'skb',
    logging: false
});


module.exports = sequelize;
