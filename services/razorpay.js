const Razorpay = require('razorpay');
const config = require('../config');

// null when real keys are not configured -> only Demo Payment works.
const razorpayClient = config.razorpay.enabled
  ? new Razorpay({ key_id: config.razorpay.keyId, key_secret: config.razorpay.keySecret })
  : null;

module.exports = razorpayClient;
