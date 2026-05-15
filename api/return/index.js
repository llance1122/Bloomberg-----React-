const { getPool } = require('../shared/db');

module.exports = async function (context, req) {
  const id = Number(req.query.id);
  if (!Number.isInteger(id) || id <= 0) {
    context.res = {
      status: 400,
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: { error: 'invalid id' },
    };
    return;
  }

  try {
    const pool = getPool();
    const [result] = await pool.query(
      `UPDATE classroom_booking
         SET status = '已完成',
             end_time = MAKETIME(HOUR(NOW()), MINUTE(NOW()), 0)
       WHERE id = ? AND status = '借用中'`,
      [id]
    );
    context.res = {
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: { affected: result.affectedRows },
    };
  } catch (err) {
    context.log.error('return failed', err);
    context.res = {
      status: 500,
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: { error: 'database error' },
    };
  }
};
