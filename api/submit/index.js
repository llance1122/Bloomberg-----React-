const { getPool } = require('../shared/db');

const MAX = 5;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^\d{2}:\d{2}$/;

function jsonResponse(context, status, body) {
  context.res = {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body,
  };
}

module.exports = async function (context, req) {
  const body = req.body || {};
  const name = String(body.name || '').trim();
  const department = String(body.department || '').trim();
  const student_id = String(body.student_id || '').trim();
  const booking_date = String(body.booking_date || '').trim();
  const start_time = String(body.start_time || '').trim();

  if (!name || !department || !student_id || !booking_date || !start_time) {
    return jsonResponse(context, 400, { status: 'error', code: 'EMPTY_FIELDS' });
  }
  if (!DATE_RE.test(booking_date) || !TIME_RE.test(start_time)) {
    return jsonResponse(context, 400, { status: 'error', code: 'INVALID_FORMAT' });
  }

  try {
    const pool = getPool();

    const [countRows] = await pool.query(
      `SELECT COUNT(*) AS total FROM classroom_booking
       WHERE status = '借用中'
         AND booking_date = CURDATE()
         AND CONCAT(booking_date, ' ', start_time) <= NOW()
         AND (end_time IS NULL OR CONCAT(booking_date, ' ', end_time) >= NOW())`
    );
    if (Number(countRows[0].total) >= MAX) {
      return jsonResponse(context, 200, { status: 'error', code: 'BOOKING_FULL' });
    }

    const [dup] = await pool.query(
      `SELECT id FROM classroom_booking
       WHERE student_id = ? AND status = '借用中' LIMIT 1`,
      [student_id]
    );
    if (dup.length > 0) {
      return jsonResponse(context, 200, { status: 'error', code: 'BOOKING_DUPLICATE' });
    }

    await pool.query(
      `INSERT INTO classroom_booking (name, department, student_id, booking_date, start_time)
       VALUES (?, ?, ?, ?, ?)`,
      [name, department, student_id, booking_date, start_time]
    );

    return jsonResponse(context, 200, { status: 'success', code: 'BOOKING_SUCCESS' });
  } catch (err) {
    context.log.error('submit failed', err);
    return jsonResponse(context, 500, { status: 'error', code: 'UNKNOWN_ERROR' });
  }
};
