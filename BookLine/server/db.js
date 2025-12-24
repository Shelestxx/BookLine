const mysql = require('mysql2');

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',      // твій логін MySQL
  password: 'root', // твій пароль MySQL
  database: 'bookline_db'
});

module.exports = pool.promise();