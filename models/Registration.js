const mongoose = require('mongoose');

const registrationSchema = new mongoose.Schema(
  {
    registrationId: { type: String, required: true, unique: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },

    participantName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    collegeName: { type: String, required: true },
    department: { type: String, required: true },
    year: { type: String, required: true },

    teamName: { type: String, default: '' },
    teamMembers: { type: [String], default: [] },

    amount: { type: Number, required: true },
    paymentId: { type: String, required: true },
    paymentStatus: { type: String, default: 'Paid' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Registration', registrationSchema);
