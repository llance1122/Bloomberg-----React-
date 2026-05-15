const mysql = require('mysql2/promise');

let pool;

function getPool() {
  if (!pool) {
    pool = mysql.createPool({
      host: process.env.MYSQL_HOST,
      port: Number(process.env.MYSQL_PORT || 3306),
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD,
      database: process.env.MYSQL_DATABASE,
      ssl: process.env.MYSQL_SSL === 'false' ? null : { rejectUnauthorized: true },
      waitForConnections: true,
      connectionLimit: 5,
      timezone: '+08:00',
      dateStrings: true,
    });
  }
  return pool;
}

module.exports = { getPool };
