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
  const guestEmail    = process.env.GUEST_EMAIL;
  const guestPassword = process.env.GUEST_PASSWORD;

let role = null;

  // if (email !== adminEmail) {
  //   return res.status(401).json({ message: 'Invalid credentials.' });
  // }

  // Direct comparison (plain text env var)
  // const isMatch = password === adminPassword;
  // if (!isMatch) {
  //   return res.status(401).json({ message: 'Invalid credentials.' });
  // }

  if (email === adminEmail && password === adminPassword) {
  role = 'admin';
} else if (email === guestEmail && password === guestPassword) {
  role = 'guest';
} else {
  return res.status(401).json({ message: 'Invalid credentials.' });
}

  // Sign JWT valid for 24 hours
  const token = jwt.sign(
    { email, role },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );

  res.json({
    message: 'Login successful.',
    token,
    admin: { email, role }
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
