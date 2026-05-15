const { getPool } = require('../shared/db');

module.exports = async function (context) {
  try {
    const pool = getPool();
    const [rows] = await pool.query(
      `SELECT id, name, department, student_id, booking_date, start_time, end_time, status
       FROM classroom_booking
       WHERE status = '借用中'
         AND booking_date = CURDATE()
       ORDER BY start_time`
    );
    context.res = {
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: rows,
    };
  } catch (err) {
    context.log.error('list failed', err);
    context.res = {
      status: 500,
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: { error: 'database error' },
    };
  }
};
