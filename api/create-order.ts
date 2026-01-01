import type { VercelRequest, VercelResponse } from '@vercel/node';
import Razorpay from 'razorpay';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';
import { createOrderSchema } from './_lib/validation';

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

// Initialize Supabase with SERVICE ROLE key (full access)
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY! // Never expose this to frontend
);

// MENU PRICES - Source of truth (stored server-side)
const MENU_PRICES: Record<string, number> = {
  'paneer-tikka': 299,
  'butter-chicken': 349,
  'dal-makhani': 249,
  'biryani': 399,
  'naan': 49,
  'gulab-jamun': 99,
};

const MIN_ORDER_AMOUNT = 50; // ₹50
const MAX_ORDER_AMOUNT = 10000; // ₹10,000
const MAX_QUANTITY_PER_ITEM = 10;

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // 1. VALIDATE INPUT
    const validationResult = createOrderSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        error: 'Invalid input',
        details: validationResult.error.format(),
      });
    }

    const { customer_name, customer_phone, customer_address, items } =
      validationResult.data;

    // 2. SERVER-SIDE PRICE VERIFICATION
    // CRITICAL: Never trust client prices!
    let calculatedTotal = 0;
    const verifiedItems = [];

    for (const item of items) {
      // Validate item exists in menu
      const serverPrice = MENU_PRICES[item.id];
      if (!serverPrice) {
        return res.status(400).json({
          error: `Invalid item: ${item.id}`,
        });
      }

      // Validate quantity
      if (item.quantity < 1 || item.quantity > MAX_QUANTITY_PER_ITEM) {
        return res.status(400).json({
          error: `Invalid quantity for ${item.name}. Must be 1-${MAX_QUANTITY_PER_ITEM}`,
        });
      }

      // Calculate using SERVER price (ignore client price)
      const itemTotal = serverPrice * item.quantity;
      calculatedTotal += itemTotal;

      verifiedItems.push({
        id: item.id,
        name: item.name,
        price: serverPrice, // Use server price
        quantity: item.quantity,
        total: itemTotal,
      });
    }

    // Validate total amount
    if (calculatedTotal < MIN_ORDER_AMOUNT) {
      return res.status(400).json({
        error: `Minimum order amount is ₹${MIN_ORDER_AMOUNT}`,
      });
    }

    if (calculatedTotal > MAX_ORDER_AMOUNT) {
      return res.status(400).json({
        error: `Maximum order amount is ₹${MAX_ORDER_AMOUNT}`,
      });
    }

    // 3. GENERATE UNIQUE ORDER NUMBER
    const orderNumber = `ORD${Date.now()}${Math.random().toString(36).substr(2, 4).toUpperCase()}`;

    // 4. CREATE RAZORPAY ORDER
    const razorpayOrder = await razorpay.orders.create({
      amount: calculatedTotal * 100, // Convert to paise
      currency: 'INR',
      receipt: orderNumber,
      notes: {
        customer_name,
        customer_phone,
        order_number: orderNumber,
      },
    });

    // 5. STORE ORDER IN DATABASE
    const { data: order, error: dbError } = await supabase
      .from('orders')
      .insert({
        order_number: orderNumber,
        razorpay_order_id: razorpayOrder.id,
        customer_name,
        customer_phone,
        customer_address,
        items: verifiedItems, // Store verified items with server prices
        total_amount: calculatedTotal,
        payment_status: 'pending',
        order_status: 'awaiting_payment',
      })
      .select()
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
      return res.status(500).json({ error: 'Failed to create order' });
    }

    // 6. RETURN ORDER DETAILS
    return res.status(200).json({
      success: true,
      order: {
        id: order.id,
        order_number: orderNumber,
        razorpay_order_id: razorpayOrder.id,
        amount: calculatedTotal,
        currency: 'INR',
      },
    });
  } catch (error) {
    console.error('Create order error:', error);
    // Never expose internal errors to client
    return res.status(500).json({
      error: 'Failed to create order. Please try again.',
    });
  }
}
