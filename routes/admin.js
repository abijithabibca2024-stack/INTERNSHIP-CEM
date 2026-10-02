const express = require('express');
const User = require('../models/User');
const Event = require('../models/Event');
const Registration = require('../models/Registration');
const asyncHandler = require('../utils/asyncHandler');
const { requireLogin, requireAdmin } = require('../middleware/auth');

const router = express.Router();

router.get('/statistics', requireLogin, requireAdmin, asyncHandler(async (req, res) => {
  const [users, events, registrations, revenueResult] = await Promise.all([
    User.countDocuments(),
    Event.countDocuments(),
    Registration.countDocuments(),
    Registration.aggregate([{ $group: { _id: null, total: { $sum: '$amount' } } }]),
  ]);

  const revenue = revenueResult.length ? revenueResult[0].total : 0;
  res.json({ users, events, registrations, revenue });
}));

module.exports = router;
