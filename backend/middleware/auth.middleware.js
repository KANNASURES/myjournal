/* ═══════════════════════════════════════════════════════════
   LUMIO — AUTH MIDDLEWARE
   Protects routes that require a logged-in user.
   Reads the JWT from the Authorization header,
   verifies it, and attaches the user payload to req.user.
═══════════════════════════════════════════════════════════ */

const jwt    = require('jsonwebtoken');
const config = require('../config/config');

function protect(req, res, next) {
  try {
    // 1. Get token from header
    //    Frontend sends: Authorization: Bearer <token>
    const authHeader = req.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    const token = authHeader.split(' ')[1];

    // 2. Verify token
    const decoded = jwt.verify(token, config.jwt.secret);

    // 3. Attach user info to request
    //    decoded contains: { id, name, email, iat, exp }
    req.user = decoded;

    // 4. Pass to next middleware / route handler
    next();

  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Session expired. Please sign in again.'
      });
    }
    return res.status(401).json({
      success: false,
      message: 'Invalid token. Please sign in again.'
    });
  }
}

module.exports = { protect };