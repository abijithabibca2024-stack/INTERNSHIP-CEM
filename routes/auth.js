const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const HttpError = require('../utils/HttpError');
const asyncHandler = require('../utils/asyncHandler');
const { createToken, publicUser } = require('../middleware/auth');

const router = express.Router();

function validateSignup({ name, email, phone, password, confirmPassword }) {
  if (!name || !email || !phone || !password || !confirmPassword) {
    throw new HttpError(400, 'All fields are required');
  }
  if (!/^\S+@\S+\.\S+$/.test(email)) {
    throw new HttpError(400, 'Invalid email');
  }
  if (!/^\d{10}$/.test(phone)) {
    throw new HttpError(400, 'Phone must be 10 digits');
  }
  if (password.length < 6) {
    throw new HttpError(400, 'Password must be at least 6 characters');
  }
  if (password !== confirmPassword) {
    throw new HttpError(400, 'Passwords do not match');
  }
}

router.post('/register', asyncHandler(async (req, res) => {
  validateSignup(req.body);

  const { name, email, phone, password } = req.body;

  const alreadyExists = await User.findOne({ email: email.toLowerCase() });
  if (alreadyExists) {
    throw new HttpError(400, 'Email already registered');
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, phone, password: hashedPassword });

  res.json({ token: createToken(user), user: publicUser(user) });
}));

router.post('/login', asyncHandler(async (req, res) => {
  const email = String(req.body.email || '').toLowerCase();
  const password = req.body.password || '';

  const user = await User.findOne({ email });
  const passwordMatches = user && (await bcrypt.compare(password, user.password));

  if (!passwordMatches) {
    throw new HttpError(401, 'Invalid email or password');
  }

  res.json({ token: createToken(user), user: publicUser(user) });
}));

module.exports = router;
