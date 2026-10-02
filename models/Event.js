const mongoose = require('mongoose');

const CATEGORIES = ['On-Stage', 'Off-Stage', 'Technical', 'Gaming'];

const eventSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    category: { type: String, required: true, enum: CATEGORIES },
    description: { type: String, default: '' },
    rules: { type: String, default: '' },
    date: { type: String, required: true },   // stored as YYYY-MM-DD text
    time: { type: String, required: true },   // stored as HH:MM text
    venue: { type: String, required: true },
    teamSize: { type: Number, default: 1 },
    fee: { type: Number, default: 50 },
    prize: { type: String, default: '' },
    registrationDeadline: { type: String, default: '' },
  },
  { timestamps: true }
);

const Event = mongoose.model('Event', eventSchema);
Event.CATEGORIES = CATEGORIES;

module.exports = Event;
