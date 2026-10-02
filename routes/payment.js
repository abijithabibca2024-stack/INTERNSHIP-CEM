const express = require('express');
const crypto = require('crypto');
const mongoose = require('mongoose');

const config = require('../config');
const razorpayClient = require('../services/razorpay');
const Event = require('../models/Event');
const Registration = require('../models/Registration');
const HttpError = require('../utils/HttpError');
const asyncHandler = require('../utils/asyncHandler');
const { requireLogin } = require('../middleware/auth');

const router = express.Router();

const REQUIRED_PARTICIPANT_FIELDS = ['participantName', 'email', 'phone', 'collegeName', 'department', 'year'];

function randomHex(bytes) {
  return crypto.randomBytes(bytes).toString('hex');
}

function totalFee(events) {
  return events.reduce((sum, event) => sum + event.fee, 0);
}

// Loads the selected events and makes sure the user can register for them.
async function loadSelectedEvents(eventIds, userId) {
  const isValidList =
    Array.isArray(eventIds) && eventIds.length > 0 && eventIds.every((id) => mongoose.isValidObjectId(id));
  if (!isValidList) {
    throw new HttpError(400, 'Select valid events');
  }

  const uniqueIds = [...new Set(eventIds)];
  const events = await Event.find({ _id: { $in: uniqueIds } });
  if (events.length !== uniqueIds.length) {
    throw new HttpError(400, 'Invalid event selected');
  }

  const existing = await Registration.findOne({
    userId,
    eventId: { $in: events.map((event) => event._id) },
  }).populate('eventId');
  if (existing) {
    throw new HttpError(400, 'You are already registered for ' + existing.eventId.name);
  }

  return events;
}

// Step 1: the browser asks for an order. The amount is always calculated here on the server.
router.post('/create-order', requireLogin, asyncHandler(async (req, res) => {
  const events = await loadSelectedEvents(req.body.eventIds, req.user.id);
  const amount = totalFee(events);

  if (req.body.mode === 'razorpay') {
    if (!config.razorpay.enabled) {
      throw new HttpError(400, 'Razorpay is not configured. Use Demo Payment.');
    }

    const order = await razorpayClient.orders.create({
      amount: amount * 100, // Razorpay works in paise
      currency: 'INR',
      receipt: 'cf_' + Date.now(),
    });
    return res.json({ demo: false, orderId: order.id, amount, keyId: config.razorpay.keyId });
  }

  res.json({ demo: true, orderId: 'demo_' + randomHex(6), amount });
}));

// Checks the Razorpay signature and amount. Returns the payment id to store.
async function confirmRazorpayPayment({ orderId, paymentId, signature }, expectedTotal) {
  if (!config.razorpay.enabled) {
    throw new HttpError(400, 'Payment failed');
  }

  const expectedSignature = crypto
    .createHmac('sha256', config.razorpay.keySecret)
    .update(orderId + '|' + paymentId)
    .digest('hex');
  if (expectedSignature !== signature) {
    throw new HttpError(400, 'Payment verification failed');
  }

  const order = await razorpayClient.orders.fetch(orderId);
  if (order.amount !== expectedTotal * 100) {
    throw new HttpError(400, 'Payment amount mismatch');
  }

  return paymentId;
}

// Step 2: after payment, save one registration per selected event.
router.post('/verify', requireLogin, asyncHandler(async (req, res) => {
  const { orderId, paymentId, signature, eventIds, form = {} } = req.body;

  const events = await loadSelectedEvents(eventIds, req.user.id);

  const missingField = REQUIRED_PARTICIPANT_FIELDS.some((field) => !String(form[field] || '').trim());
  if (missingField) {
    throw new HttpError(400, 'Please fill all participant details');
  }

  const teamMembers = (form.teamMembers || []).map((name) => String(name).trim()).filter(Boolean);
  const teamCount = teamMembers.length + 1; // members + the participant
  for (const event of events) {
    if (teamCount > event.teamSize) {
      throw new HttpError(400, `${event.name} allows a team of max ${event.teamSize}`);
    }
  }

  let finalPaymentId;
  if (String(orderId).startsWith('demo_')) {
    finalPaymentId = 'DEMO_' + randomHex(5).toUpperCase();
  } else {
    finalPaymentId = await confirmRazorpayPayment({ orderId, paymentId, signature }, totalFee(events));
  }

  const savedIds = [];
  for (const event of events) {
    const registration = await Registration.create({
      registrationId: 'CF26-' + randomHex(3).toUpperCase(),
      userId: req.user.id,
      eventId: event._id,
      participantName: form.participantName,
      email: form.email,
      phone: form.phone,
      collegeName: form.collegeName,
      department: form.department,
      year: form.year,
      teamName: form.teamName || '',
      teamMembers,
      amount: event.fee,
      paymentId: finalPaymentId,
    });
    savedIds.push(registration._id);
  }

  const registrations = await Registration.find({ _id: { $in: savedIds } }).populate('eventId');
  res.json(registrations);
}));

module.exports = router;
