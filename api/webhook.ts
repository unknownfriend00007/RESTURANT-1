import type { VercelRequest, VercelResponse } from '@vercel/node';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';
import Razorpay from 'razorpay';

// Initialize Supabase with SERVICE ROLE key
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

/**
 * WEBHOOK SIGNATURE VERIFICATION
 * Validates webhook authenticity using HMAC-SHA256
 */
function verifyWebhookSignature(
  body: string,
  signature: string,
  secret: string
): boolean {
  try {
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(body)
      .digest('hex');

    return crypto.timingSafeEqual(
      Buffer.from(expectedSignature, 'utf8'),
      Buffer.from(signature, 'utf8')
    );
  } catch (error) {
    console.error('Webhook signature verification error:', error);
    return false;
  }
}

/**
 * RAZORPAY WEBHOOK HANDLER
 * Processes payment events securely
 */
export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // 1. VERIFY WEBHOOK SIGNATURE
    const webhookSignature = req.headers['x-razorpay-signature'] as string;
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET!;

    if (!webhookSignature) {
      console.error('Missing webhook signature');
      return res.status(400).json({ error: 'Missing signature' });
    }

    // Get raw body for signature verification
    const rawBody = JSON.stringify(req.body);

    const isValidSignature = verifyWebhookSignature(
      rawBody,
      webhookSignature,
      webhookSecret
    );

    if (!isValidSignature) {
      console.error('Invalid webhook signature');
      return res.status(400).json({ error: 'Invalid signature' });
    }

    // 2. PARSE WEBHOOK EVENT
    const { event, payload } = req.body;

    console.log('Webhook received:', event);

    // 3. HANDLE DIFFERENT EVENTS
    switch (event) {
      case 'payment.captured':
        await handlePaymentCaptured(payload.payment.entity);
        break;

      case 'payment.failed':
        await handlePaymentFailed(payload.payment.entity);
        break;

      case 'order.paid':
        await handleOrderPaid(payload.order.entity);
        break;

      default:
        console.log('Unhandled webhook event:', event);
    }

    // 4. ACKNOWLEDGE WEBHOOK
    return res.status(200).json({ status: 'ok' });
  } catch (error) {
    console.error('Webhook error:', error);
    return res.status(500).json({ error: 'Webhook processing failed' });
  }
}

/**
 * HANDLE PAYMENT CAPTURED EVENT
 */
async function handlePaymentCaptured(payment: any) {
  try {
    const orderId = payment.order_id;
    const paymentId = payment.id;
    const amount = payment.amount / 100; // Convert from paise

    // Find order
    const { data: order } = await supabase
      .from('orders')
      .select('*')
      .eq('razorpay_order_id', orderId)
      .single();

    if (!order) {
      console.error('Order not found for payment:', paymentId);
      return;
    }

    // Idempotent check
    if (order.payment_status === 'paid') {
      console.log('Payment already processed:', paymentId);
      return;
    }

    // Update order
    await supabase
      .from('orders')
      .update({
        razorpay_payment_id: paymentId,
        payment_status: 'paid',
        order_status: 'paid',
        paid_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', order.id);

    console.log('Payment captured successfully:', paymentId);
  } catch (error) {
    console.error('Error handling payment captured:', error);
  }
}

/**
 * HANDLE PAYMENT FAILED EVENT
 */
async function handlePaymentFailed(payment: any) {
  try {
    const orderId = payment.order_id;
    const paymentId = payment.id;
    const errorReason = payment.error_reason || 'Unknown error';

    // Find order
    const { data: order } = await supabase
      .from('orders')
      .select('*')
      .eq('razorpay_order_id', orderId)
      .single();

    if (!order) {
      console.error('Order not found for failed payment:', paymentId);
      return;
    }

    // Update order
    await supabase
      .from('orders')
      .update({
        payment_status: 'failed',
        order_status: 'payment_failed',
        updated_at: new Date().toISOString(),
      })
      .eq('id', order.id);

    console.log('Payment failed:', paymentId, errorReason);
  } catch (error) {
    console.error('Error handling payment failed:', error);
  }
}

/**
 * HANDLE ORDER PAID EVENT
 */
async function handleOrderPaid(order: any) {
  try {
    const orderId = order.id;

    // Find order
    const { data: dbOrder } = await supabase
      .from('orders')
      .select('*')
      .eq('razorpay_order_id', orderId)
      .single();

    if (!dbOrder) {
      console.error('Order not found:', orderId);
      return;
    }

    // Idempotent check
    if (dbOrder.payment_status === 'paid') {
      console.log('Order already marked as paid:', orderId);
      return;
    }

    // Update order
    await supabase
      .from('orders')
      .update({
        payment_status: 'paid',
        order_status: 'paid',
        paid_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', dbOrder.id);

    console.log('Order marked as paid:', orderId);
  } catch (error) {
    console.error('Error handling order paid:', error);
  }
}
