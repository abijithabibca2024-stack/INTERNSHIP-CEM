const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Event = require('../models/Event');

// Each entry is [name, description, max team size]
const EVENTS_BY_CATEGORY = {
  'On-Stage': {
    venue: 'Main Auditorium',
    extraRule: '',
    firstPrize: 2000,
    events: [
      ['Singing', 'Solo singing showdown', 1],
      ['Dance', 'Group dance battle', 8],
      ['Drama', 'Stage play competition', 10],
      ['Fashion Show', 'Ramp walk with themes', 6],
      ['Stand-up Comedy', 'Five minutes to win the crowd', 1],
    ],
  },
  'Off-Stage': {
    venue: 'Seminar Hall',
    extraRule: '',
    firstPrize: 2000,
    events: [
      ['Quiz', 'General knowledge quiz', 3],
      ['Debate', 'Parliamentary style debate', 2],
      ['Photography', 'Theme based photo contest', 1],
      ['Poster Making', 'Design a message poster', 1],
      ['Essay Writing', 'Write on a surprise topic', 1],
    ],
  },
  Gaming: {
    venue: 'Computer Lab',
    extraRule: '',
    firstPrize: 2000,
    events: [
      ['BGMI', 'Squad battle royale', 4],
      ['Free Fire', 'Squad battle royale', 4],
      ['Valorant', '5v5 tactical shooter', 5],
      ['FIFA', '1v1 football tournament', 1],
      ['Chess', 'Rapid chess knockout', 1],
    ],
  },
  Technical: {
    venue: 'Computer Lab',
    extraRule: 'Bring your own laptop. ',
    firstPrize: 3000,
    events: [
      ['Code Clash', 'Solve. Code. Win.', 1],
      ['Web Design Challenge', 'Design a stunning responsive website', 2],
      ['Debugging Battle', 'Find and fix bugs faster than everyone', 1],
      ['AI Innovation Challenge', 'Pitch an AI idea that changes things', 3],
      ['Cyber Security Challenge', 'Capture the flag and defend the network', 3],
      ['Hackathon', 'Build a working product in 24 hours', 4],
      ['UI/UX Challenge', 'Craft delightful user experiences', 2],
      ['Project Expo', 'Showcase your best tech project', 4],
    ],
  },
};

function buildEvent(category, settings, [name, description, teamSize], index) {
  return {
    name,
    category,
    description,
    teamSize,
    fee: 50,
    venue: settings.venue,
    date: '2026-11-' + (12 + (index % 3)),      // 12, 13 or 14 November
    time: 9 + (index % 6) + ':00',
    rules: `Carry college ID. ${settings.extraRule}Reach 15 minutes early. Judges decision is final. Team size up to ${teamSize}.`,
    prize: '₹' + (settings.firstPrize + (index % 3) * 1000),
    registrationDeadline: '2026-11-08',
  };
}

async function seedAdmin() {
  const adminExists = await User.findOne({ role: 'admin' });
  if (adminExists) return;

  await User.create({
    name: 'Admin',
    email: 'admin@collegefest.com',
    phone: '9999999999',
    role: 'admin',
    password: await bcrypt.hash('Admin@123', 10),
  });
  console.log('Created admin account');
}

// Adds the events of any category that has none yet.
async function seedEvents() {
  for (const [category, settings] of Object.entries(EVENTS_BY_CATEGORY)) {
    const alreadySeeded = await Event.countDocuments({ category });
    if (alreadySeeded) continue;

    const events = settings.events.map((entry, index) => buildEvent(category, settings, entry, index));
    await Event.insertMany(events);
    console.log(`Seeded ${events.length} ${category} events`);
  }
}

async function seedDatabase() {
  await seedAdmin();
  await seedEvents();
}

module.exports = seedDatabase;
