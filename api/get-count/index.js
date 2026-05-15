const { getPool } = require('../shared/db');

const MAX = 5;

module.exports = async function (context) {
  try {
    const pool = getPool();
    const [rows] = await pool.query(
      `SELECT COUNT(*) AS total FROM classroom_booking
       WHERE status = '借用中'
         AND booking_date = CURDATE()
         AND CONCAT(booking_date, ' ', start_time) <= NOW()
         AND (end_time IS NULL OR CONCAT(booking_date, ' ', end_time) >= NOW())`
    );
    const total = Number(rows[0].total);
    context.res = {
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: { total, remaining: MAX - total, max: MAX },
    };
  } catch (err) {
    context.log.error('get-count failed', err);
    context.res = {
      status: 500,
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: { error: 'database error' },
    };
  }
};
