const jwt = require('jsonwebtoken');

const adminAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Unauthorized. No token provided.' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ success: false, message: 'Unauthorized. Token missing.' });
    }

    const secret = process.env.ADMIN_JWT_SECRET || 'fallback_admin_secret_key_change_in_prod';
    const decoded = jwt.verify(token, secret);

    if (decoded.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Forbidden. Admin role required.' });
    }

    req.admin = decoded;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Unauthorized. Token expired.' });
    }
    return res.status(401).json({ success: false, message: 'Unauthorized. Invalid token.' });
  }
};

module.exports = { adminAuth };
