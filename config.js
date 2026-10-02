require('dotenv').config();

const DEFAULT_MONGO_URI = 'mongodb://127.0.0.1:27017/collegefest';

// Values copied straight from .env.example start with "your_",
// so we treat them as "not filled in yet".
function isRealValue(value) {
  return Boolean(value) && !value.startsWith('your_');
}

const razorpayKeyId = process.env.RAZORPAY_KEY_ID;
const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET;

module.exports = {
  port: process.env.PORT || 5000,
  jwtSecret: process.env.JWT_SECRET || 'dev_secret_change_me',
  mongoUri: isRealValue(process.env.MONGO_URI) ? process.env.MONGO_URI : DEFAULT_MONGO_URI,

  razorpay: {
    keyId: razorpayKeyId,
    keySecret: razorpayKeySecret,
    enabled: isRealValue(razorpayKeyId) && isRealValue(razorpayKeySecret),
  },
};
