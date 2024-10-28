const { Pool } = require('pg');
require('dotenv').config();


const pool = new Pool({
    user: process.env.USER_DATABASE,
    host: process.env.HOST,
    database: 'postgres',
    password: process.env.PASSWORD_DATABASE,
    port: process.env.PORT_DATABASE,
});

module.exports = pool;
