const jwt = require('jsonwebtoken');

/**
 * Middleware: Verifies JWT token from Authorization header.
 * Attaches decoded admin payload to req.admin on success.
 */
const protect = (req, res, next) => {
  const authHeader = req.headers.authorization;

  // Check header format: "Bearer <token>"
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided. Authorization denied.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.admin = decoded; // { email, iat, exp }
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Token is invalid or expired.' });
  }
};

module.exports = { protect };
