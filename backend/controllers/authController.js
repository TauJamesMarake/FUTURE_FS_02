const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate admin and return a JWT
 * @access  Public
 */
const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  // Compare against environment-configured admin credentials
  const adminEmail    = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (email !== adminEmail) {
    return res.status(401).json({ message: 'Invalid credentials.' });
  }

  // Direct comparison (plain text env var) - i will swap for bcrypt hash in production
  const isMatch = password === adminPassword;
  if (!isMatch) {
    return res.status(401).json({ message: 'Invalid credentials.' });
  }

  // Sign JWT valid for 24 hours
  const token = jwt.sign(
    { email: adminEmail, role: 'admin' },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );

  res.json({
    message: 'Login successful.',
    token,
    admin: { email: adminEmail, role: 'admin' }
  });
};

/**
 * @route   GET /api/auth/profile
 * @desc    Return the current admin profile (from JWT)
 * @access  Protected
 */
const getProfile = (req, res) => {
  res.json({
    email: req.admin.email,
    role:  req.admin.role || 'admin'
  });
};

module.exports = { login, getProfile };
