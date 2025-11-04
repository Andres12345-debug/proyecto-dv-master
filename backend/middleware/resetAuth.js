// middleware/resetAuth.js
const jwt = require('jsonwebtoken');
const { pool } = require('../config/database');

const authenticateResetToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = (authHeader && authHeader.startsWith('Bearer '))
    ? authHeader.substring(7)
    : (req.body?.reset_token || req.query?.reset_token);

  if (!token) {
    return res.status(401).json({ success: false, message: 'Reset token required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.RESET_JWT_SECRET);
    if (!decoded || decoded.purpose !== 'pwd_reset' || !decoded.userId) {
      return res.status(400).json({ success: false, message: 'Invalid or expired reset token' });
    }

    const [users] = await pool.execute(
      'SELECT id FROM users WHERE id = ? AND deleted_at IS NULL LIMIT 1',
      [decoded.userId]
    );
    if (users.length === 0) {
      return res.status(400).json({ success: false, message: 'Invalid or expired reset token' });
    }

    req.resetUserId = decoded.userId;
    next();
  } catch (err) {
    return res.status(400).json({ success: false, message: 'Invalid or expired reset token' });
  }
};

module.exports = { authenticateResetToken };
