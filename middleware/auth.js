const jwt = require('jsonwebtoken');
const config = require('../config');

// Reads "Authorization: Bearer <token>" and puts the decoded user on req.user.
function requireLogin(req, res, next) {
  const token = (req.headers.authorization || '').split(' ')[1];

  try {
    req.user = jwt.verify(token, config.jwtSecret);
    next();
  } catch (error) {
    res.status(401).json({ error: 'Please login first' });
  }
}

// Use after requireLogin.
function requireAdmin(req, res, next) {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access only' });
  }
  next();
}

function createToken(user) {
  const payload = { id: user._id, role: user.role, name: user.name };
  return jwt.sign(payload, config.jwtSecret, { expiresIn: '7d' });
}

// The user fields that are safe to send to the browser (no password).
function publicUser(user) {
  return { id: user._id, name: user.name, email: user.email, role: user.role };
}

module.exports = { requireLogin, requireAdmin, createToken, publicUser };
