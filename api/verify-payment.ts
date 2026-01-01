import type { VercelRequest, VercelResponse } from '@vercel/node';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';
import Razorpay from 'razorpay';
import { verifyPaymentSchema } from './_lib/validation';

// Initialize Supabase with SERVICE ROLE key
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

/**
 * TIMING-SAFE STRING COMPARISON
 * Prevents timing attacks by ensuring comparison takes constant time
 */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }
  
  const bufA = Buffer.from(a, 'utf8');
  const bufB = Buffer.from(b, 'utf8');
  
  return crypto.timingSafeEqual(bufA, bufB);
}

/**
 * CRYPTOGRAPHIC SIGNATURE VERIFICATION
 * Uses HMAC-SHA256 to verify payment authenticity
 */
function verifyRazorpaySignature(
  orderId: string,
  paymentId: string,
  signature: string
): boolean {
  try {
    // Generate expected signature using HMAC-SHA256
    const body = orderId + '|' + paymentId;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(body)
      .digest('hex');

    // Timing-safe comparison
    return timingSafeEqual(expectedSignature, signature);
  } catch (error) {
    console.error('Signature verification error:', error);
    return false;
  }
}

/**
 * VERIFY PAYMENT WITH RAZORPAY API
 * Double-check payment status directly with Razorpay
 */
async function verifyPaymentWithRazorpay(paymentId: string): Promise<boolean> {
  try {
    const payment = await razorpay.payments.fetch(paymentId);
    return payment.status === 'captured' || payment.status === 'authorized';
  } catch (error) {
    console.error('Razorpay verification error:', error);
    return false;
  }
}

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
    const validationResult = verifyPaymentSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        error: 'Invalid input',
        details: validationResult.error.format(),
      });
    }

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = validationResult.data;

    // 2. CRYPTOGRAPHIC SIGNATURE VERIFICATION
    const isValidSignature = verifyRazorpaySignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    );

    if (!isValidSignature) {
      console.error('Invalid signature detected:', {
        order_id: razorpay_order_id,
        payment_id: razorpay_payment_id,
      });
      return res.status(400).json({
        error: 'Payment verification failed',
      });
    }

    // 3. VERIFY PAYMENT WITH RAZORPAY API (Double-check)
    const isPaymentValid = await verifyPaymentWithRazorpay(razorpay_payment_id);
    if (!isPaymentValid) {
      console.error('Payment not found or invalid in Razorpay:', razorpay_payment_id);
      return res.status(400).json({
        error: 'Payment verification failed',
      });
    }

    // 4. FIND ORDER IN DATABASE
    const { data: order, error: fetchError } = await supabase
      .from('orders')
      .select('*')
      .eq('razorpay_order_id', razorpay_order_id)
      .single();

    if (fetchError || !order) {
      console.error('Order not found:', razorpay_order_id);
      return res.status(404).json({ error: 'Order not found' });
    }

    // 5. CHECK IF ALREADY PROCESSED (Idempotent)
    if (order.payment_status === 'paid') {
      return res.status(200).json({
        success: true,
        message: 'Payment already verified',
        order: {
          id: order.id,
          order_number: order.order_number,
          status: order.order_status,
        },
      });
    }

    // 6. UPDATE ORDER STATUS
    const { data: updatedOrder, error: updateError } = await supabase
      .from('orders')
      .update({
        razorpay_payment_id,
        payment_status: 'paid',
        order_status: 'paid',
        paid_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', order.id)
      .select()
      .single();

    if (updateError) {
      console.error('Failed to update order:', updateError);
      return res.status(500).json({ error: 'Failed to update order' });
    }

    // 7. SUCCESS RESPONSE
    return res.status(200).json({
      success: true,
      order: {
        id: updatedOrder.id,
        order_number: updatedOrder.order_number,
        status: updatedOrder.order_status,
        amount: updatedOrder.total_amount,
      },
    });
  } catch (error) {
    console.error('Verify payment error:', error);
    return res.status(500).json({
      error: 'Payment verification failed. Please contact support.',
    });
  }
}
