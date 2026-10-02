const express = require('express');
const mongoose = require('mongoose');
const Event = require('../models/Event');
const HttpError = require('../utils/HttpError');
const asyncHandler = require('../utils/asyncHandler');
const { requireLogin, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Only copy the fields we allow, and convert numbers.
function pickEventFields(body) {
  return {
    name: body.name,
    category: body.category,
    description: body.description,
    rules: body.rules,
    date: body.date,
    time: body.time,
    venue: body.venue,
    teamSize: Number(body.teamSize) || 1,
    fee: Number(body.fee) || 50,
    prize: body.prize,
    registrationDeadline: body.registrationDeadline,
  };
}

function validateEvent(body) {
  const { name, category, date, time, venue } = body;
  if (!name || !category || !date || !time || !venue) {
    throw new HttpError(400, 'Name, category, date, time and venue are required');
  }
}

// Anyone can view events
router.get('/', asyncHandler(async (req, res) => {
  const events = await Event.find().sort({ category: 1, createdAt: 1, _id: 1 });
  res.json(events);
}));

router.get('/:id', asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    throw new HttpError(404, 'Event not found');
  }

  const event = await Event.findById(req.params.id);
  if (!event) {
    throw new HttpError(404, 'Event not found');
  }

  res.json(event);
}));

// Only admins can add, edit or delete events
router.post('/', requireLogin, requireAdmin, asyncHandler(async (req, res) => {
  validateEvent(req.body);
  const event = await Event.create(pickEventFields(req.body));
  res.json(event);
}));

router.put('/:id', requireLogin, requireAdmin, asyncHandler(async (req, res) => {
  validateEvent(req.body);

  const event = await Event.findByIdAndUpdate(req.params.id, pickEventFields(req.body), { new: true });
  if (!event) {
    throw new HttpError(404, 'Event not found');
  }

  res.json(event);
}));

router.delete('/:id', requireLogin, requireAdmin, asyncHandler(async (req, res) => {
  await Event.findByIdAndDelete(req.params.id);
  res.json({ ok: true });
}));

module.exports = router;
