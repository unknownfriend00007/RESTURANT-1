import { z } from 'zod';

// Phone number validation (Indian format)
const phoneRegex = /^[6-9]\d{9}$/;

// Name validation (letters, spaces, hyphens)
const nameRegex = /^[a-zA-Z\s-]{2,50}$/;

/**
 * ORDER ITEM SCHEMA
 */
export const orderItemSchema = z.object({
  id: z.string().min(1, 'Item ID required'),
  name: z.string().min(1, 'Item name required'),
  price: z.number().positive('Price must be positive'),
  quantity: z.number().int().min(1).max(10, 'Max 10 items per product'),
});

/**
 * CREATE ORDER SCHEMA
 */
export const createOrderSchema = z.object({
  customer_name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be less than 50 characters')
    .regex(nameRegex, 'Name can only contain letters, spaces, and hyphens'),
  
  customer_phone: z
    .string()
    .regex(phoneRegex, 'Invalid Indian phone number (must be 10 digits starting with 6-9)'),
  
  customer_address: z
    .string()
    .min(10, 'Address must be at least 10 characters')
    .max(200, 'Address must be less than 200 characters'),
  
  items: z
    .array(orderItemSchema)
    .min(1, 'At least one item required')
    .max(20, 'Maximum 20 different items allowed'),
});

/**
 * VERIFY PAYMENT SCHEMA
 */
export const verifyPaymentSchema = z.object({
  razorpay_order_id: z.string().min(1, 'Order ID required'),
  razorpay_payment_id: z.string().min(1, 'Payment ID required'),
  razorpay_signature: z.string().min(1, 'Signature required'),
});

/**
 * WEBHOOK EVENT SCHEMA
 */
export const webhookEventSchema = z.object({
  event: z.string(),
  payload: z.record(z.any()),
});
