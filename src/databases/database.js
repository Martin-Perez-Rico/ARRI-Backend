import config from "./../config";

require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    host:config.host,
    database: config.database,
    user: config.user,
    password: config.password,
    port: config.port,
    ssl: {
        rejectUnauthorized: false
    }
});
  

const getConnection=()=>{
    return pool;
}

module.exports = {
    getConnection
}