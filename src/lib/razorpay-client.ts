/**
 * RAZORPAY CLIENT (Frontend)
 * Handles payment flow with Razorpay Checkout
 */

const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID;

if (!RAZORPAY_KEY_ID) {
  throw new Error('Missing Razorpay Key ID');
}

export interface PaymentOptions {
  orderId: string;
  amount: number;
  customerName: string;
  customerPhone: string;
  onSuccess: (response: RazorpayResponse) => void;
  onFailure: () => void;
}

export interface RazorpayResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

/**
 * Open Razorpay payment modal
 */
export function openRazorpayCheckout(options: PaymentOptions) {
  const rzpOptions: RazorpayOptions = {
    key: RAZORPAY_KEY_ID,
    amount: options.amount * 100, // Convert to paise
    currency: 'INR',
    name: import.meta.env.VITE_APP_NAME || 'Restaurant',
    description: 'Order Payment',
    order_id: options.orderId,
    prefill: {
      name: options.customerName,
      contact: options.customerPhone,
    },
    theme: {
      color: '#f97316', // Orange
    },
    handler: options.onSuccess,
    modal: {
      ondismiss: options.onFailure,
    },
  };

  const razorpay = new window.Razorpay(rzpOptions);
  razorpay.open();
}

/**
 * Create order on backend
 */
export async function createOrder(data: {
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  items: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
  }>;
}) {
  const response = await fetch('/api/create-order', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create order');
  }

  return response.json();
}

/**
 * Verify payment on backend
 */
export async function verifyPayment(data: {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}) {
  const response = await fetch('/api/verify-payment', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Payment verification failed');
  }

  return response.json();
}
