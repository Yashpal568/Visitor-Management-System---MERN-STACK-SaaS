const Razorpay = require("razorpay");

let razorpay = null;

if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
  try {
    razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET
    });
  } catch (error) {
    console.error("❌ Failed to initialize Razorpay:", error.message);
  }
} else {
  console.warn("⚠️ Razorpay keys missing. Razorpay features will be disabled (Mock mode active).");
}

module.exports = razorpay;
