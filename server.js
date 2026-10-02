const path = require('path');
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

const config = require('./config');
const seedDatabase = require('./utils/seed');

const app = express();

app.use(cors());
app.use(express.json());

// ---------- API ----------
app.use('/api/auth', require('./routes/auth'));
app.use('/api/events', require('./routes/events'));
app.use('/api/payment', require('./routes/payment'));
app.use('/api/registrations', require('./routes/registrations'));
app.use('/api/admin', require('./routes/admin'));

// Lets the website know whether the Razorpay button should be enabled.
app.get('/api/config', (req, res) => {
  res.json({
    realPay: config.razorpay.enabled,
    keyId: config.razorpay.enabled ? config.razorpay.keyId : null,
  });
});

app.use('/api', (req, res) => {
  res.status(404).json({ error: 'API route not found' });
});

// ---------- WEBSITE ----------
const publicFolder = path.join(__dirname, 'public');
app.use(express.static(publicFolder));
app.get('*', (req, res) => {
  res.sendFile(path.join(publicFolder, 'index.html'));
});

// ---------- ERROR HANDLER ----------
// Any error thrown inside a route ends up here.
app.use((error, req, res, next) => {
  const status = error.status || 500;
  res.status(status).json({ error: error.message });
});

// ---------- START ----------
async function startServer() {
  let mongoUri = config.mongoUri;
  let memoryServer = null;

  try {
    try {
      await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 8000 });
      console.log('MongoDB connected');
    } catch (connectError) {
      const isLocalMongoUnavailable = /ECONNREFUSED|MongoServerSelectionError|serverSelectionTimeoutMS/.test(connectError.message || '');

      if (!isLocalMongoUnavailable) {
        throw connectError;
      }

      console.log('MongoDB not available on localhost, starting an in-memory database...');
      memoryServer = await MongoMemoryServer.create();
      mongoUri = memoryServer.getUri();
      await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 20000 });
      console.log('In-memory MongoDB connected');
    }

    await seedDatabase();

    app.listen(config.port, () => {
      const paymentMode = config.razorpay.enabled ? 'Razorpay enabled' : 'Demo payment mode';
      console.log(`COLLEGE FEST running at http://localhost:${config.port} (${paymentMode})`);
    });
  } catch (error) {
    console.error('Failed to start app:', error.message);
    console.error('Check MONGO_URI in your .env file (see README troubleshooting).');
    process.exit(1);
  }
}

startServer();
