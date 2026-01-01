import Razorpay from 'razorpay';

/**
 * RAZORPAY SDK INITIALIZATION
 * Used by backend API functions
 */
export const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

/**
 * RAZORPAY CONFIG
 */
export const RAZORPAY_CONFIG = {
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
  webhook_secret: process.env.RAZORPAY_WEBHOOK_SECRET!,
};
