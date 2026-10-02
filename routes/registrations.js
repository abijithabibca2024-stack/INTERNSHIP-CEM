const express = require('express');
const Registration = require('../models/Registration');
const asyncHandler = require('../utils/asyncHandler');
const { requireLogin } = require('../middleware/auth');

const router = express.Router();

// Normal users see their own registrations.
// Admins see everyone's and can search / filter by category.
router.get('/', requireLogin, asyncHandler(async (req, res) => {
  const isAdmin = req.user.role === 'admin';
  const filter = isAdmin ? {} : { userId: req.user.id };

  let registrations = await Registration.find(filter).populate('eventId').sort({ createdAt: -1 });

  if (isAdmin) {
    const searchText = String(req.query.q || '').toLowerCase();
    const category = req.query.category;

    registrations = registrations.filter((reg) => {
      if (!reg.eventId) return false; // event was deleted

      const matchesCategory = !category || reg.eventId.category === category;
      const searchableText = [reg.registrationId, reg.participantName, reg.email, reg.collegeName, reg.eventId.name]
        .join(' ')
        .toLowerCase();
      const matchesSearch = !searchText || searchableText.includes(searchText);

      return matchesCategory && matchesSearch;
    });
  }

  res.json(registrations);
}));

module.exports = router;
