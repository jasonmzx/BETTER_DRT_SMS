const mysql = require('mysql2');

const db_pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'drt_sms_db',
    multipleStatements: true
});

module.exports = db_pool;