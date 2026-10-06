const express = require('express');
const mongoose = require('mongoose');
const Event = require('../models/Event');
const HttpError = require('../utils/HttpError');
const asyncHandler = require('../utils/asyncHandler');
const { requireLogin, requireAdmin } = require('../middleware/auth');

const router = express.Router();

function isValidDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}

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
    teamSize: Number(body.teamSize),
    fee: Number(body.fee),
    prize: body.prize,
    registrationDeadline: body.registrationDeadline,
  };
}

function validateEvent(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    throw new HttpError(400, 'Event details are required');
  }

  const { name, category, date, time, venue } = body;
  if (![name, category, date, time, venue].every((value) => typeof value === 'string' && value.trim())) {
    throw new HttpError(400, 'Name, category, date, time and venue are required');
  }
  if (!Event.CATEGORIES.includes(category)) {
    throw new HttpError(400, 'Invalid event category');
  }
  if (!isValidDate(date)) {
    throw new HttpError(400, 'Date must be a valid date');
  }
  if (!/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(time)) {
    throw new HttpError(400, 'Time must be in HH:MM format');
  }
  if (body.registrationDeadline && !isValidDate(body.registrationDeadline)) {
    throw new HttpError(400, 'Registration deadline must be a valid date');
  }

  const teamSize = Number(body.teamSize);
  if (!Number.isSafeInteger(teamSize) || teamSize < 1) {
    throw new HttpError(400, 'Max team size must be a positive whole number');
  }
  const fee = Number(body.fee);
  if (!Number.isFinite(fee) || fee < 0) {
    throw new HttpError(400, 'Fee must be zero or greater');
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
  if (!mongoose.isValidObjectId(req.params.id)) {
    throw new HttpError(404, 'Event not found');
  }
  validateEvent(req.body);

  const event = await Event.findByIdAndUpdate(req.params.id, pickEventFields(req.body), { new: true });
  if (!event) {
    throw new HttpError(404, 'Event not found');
  }

  res.json(event);
}));

router.delete('/:id', requireLogin, requireAdmin, asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    throw new HttpError(404, 'Event not found');
  }
  const event = await Event.findByIdAndDelete(req.params.id);
  if (!event) {
    throw new HttpError(404, 'Event not found');
  }
  res.json({ ok: true });
}));

module.exports = router;
