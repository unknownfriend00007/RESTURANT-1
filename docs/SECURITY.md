# Security Documentation 🔒

This document details all security measures implemented in the restaurant ordering system.

## Security Principles

1. **Defense in Depth** - Multiple layers of security
2. **Least Privilege** - Minimum necessary access
3. **Zero Trust** - Never trust client data
4. **Cryptographic Verification** - All payments cryptographically verified
5. **Input Validation** - All inputs validated and sanitized

## 1. Server-Side Price Verification

### Problem
Clients can manipulate prices in browser before sending to server.

### Solution
**NEVER trust prices from client.** All prices stored server-side as source of truth.

```typescript
// ❌ BAD - Trusting client price
const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

// ✅ GOOD - Server calculates from source of truth
const MENU_PRICES = { 'paneer-tikka': 299, ... };
const serverPrice = MENU_PRICES[item.id];
const total = serverPrice * item.quantity;
```

### Implementation
See `api/create-order.ts` lines 30-80.

## 2. Cryptographic Payment Verification

### Problem
Attackers could send fake payment success requests.

### Solution
Use **HMAC-SHA256** signature verification.

```typescript
// Generate signature
const body = orderId + '|' + paymentId;
const expectedSignature = crypto
  .createHmac('sha256', RAZORPAY_KEY_SECRET)
  .update(body)
  .digest('hex');

// Timing-safe comparison (prevents timing attacks)
if (!timingSafeEqual(expectedSignature, receivedSignature)) {
  throw new Error('Invalid signature');
}
```

### Why Timing-Safe?
Normal string comparison (`===`) returns early on first mismatch, allowing timing attacks to guess signatures byte-by-byte.

### Implementation
See `api/verify-payment.ts` lines 15-40.

## 3. Webhook Security

### Problem
Anyone could send fake webhook events to our endpoint.

### Solution
Verify webhook signature on every request.

```typescript
const webhookSignature = req.headers['x-razorpay-signature'];
const rawBody = JSON.stringify(req.body);

const expectedSignature = crypto
  .createHmac('sha256', WEBHOOK_SECRET)
  .update(rawBody)
  .digest('hex');

if (!timingSafeEqual(webhookSignature, expectedSignature)) {
  return res.status(400).json({ error: 'Invalid signature' });
}
```

### Idempotency
Webhooks can be sent multiple times. Always check if already processed:

```typescript
if (order.payment_status === 'paid') {
  console.log('Already processed');
  return; // Don't process again
}
```

### Implementation
See `api/webhook.ts` lines 20-50.

## 4. Environment Variable Security

### Public vs Secret Keys

| Variable | Type | Used In | Exposed? |
|----------|------|---------|----------|
| `VITE_RAZORPAY_KEY_ID` | Public | Frontend | ✅ Yes |
| `RAZORPAY_KEY_ID` | Public | Backend | ✅ Yes |
| `RAZORPAY_KEY_SECRET` | **Secret** | Backend | ❌ **NEVER** |
| `RAZORPAY_WEBHOOK_SECRET` | **Secret** | Backend | ❌ **NEVER** |
| `SUPABASE_SERVICE_KEY` | **Secret** | Backend | ❌ **NEVER** |

### Rules
1. **VITE_** prefix = Public (exposed to browser)
2. **No prefix** = Secret (backend only)
3. Secret keys **NEVER** in frontend code
4. Secret keys **NEVER** in git repository

### Verification
```bash
# Check what's exposed to browser
grep -r "RAZORPAY_KEY_SECRET" src/  # Should find NOTHING
grep -r "VITE_" src/                # OK to use
```

## 5. Input Validation

All inputs validated using **Zod** schemas.

### Phone Number Validation
```typescript
// Indian phone: 10 digits, starts with 6-9
const phoneRegex = /^[6-9]\d{9}$/;
```

### Name Validation
```typescript
// 2-50 characters, letters only
const nameRegex = /^[a-zA-Z\s-]{2,50}$/;
```

### Address Validation
```typescript
// 10-200 characters
z.string().min(10).max(200)
```

### Quantity Validation
```typescript
// 1-10 items per product
z.number().int().min(1).max(10)
```

### Amount Validation
```typescript
// Min ₹50, Max ₹10,000
if (total < 50 || total > 10000) {
  throw new Error('Invalid amount');
}
```

### Implementation
See `api/_lib/validation.ts`.

## 6. Database Security (RLS)

### Row Level Security Policies

```sql
-- Customers can only view own orders
CREATE POLICY "Customers can view own orders"
  ON orders FOR SELECT
  USING (
    customer_phone = current_user_phone
    OR auth.role() = 'service_role'
  );

-- Only backend can insert/update
CREATE POLICY "Only service role can insert"
  ON orders FOR INSERT
  WITH CHECK (auth.role() = 'service_role');

-- No deletion allowed
CREATE POLICY "No deletion"
  ON orders FOR DELETE
  USING (false);
```

### Benefits
1. **Defense in depth** - Even if API compromised, database protected
2. **User isolation** - Users can't access other users' data
3. **Audit trail** - No deletion, only status changes

### Implementation
See `database/schema.sql` lines 80-120.

## 7. SQL Injection Prevention

### Problem
```typescript
// ❌ BAD - SQL injection vulnerable
const query = `SELECT * FROM orders WHERE phone = '${phone}'`;
```

### Solution
Use **parameterized queries** (Supabase does this automatically):

```typescript
// ✅ GOOD - Safe from SQL injection
const { data } = await supabase
  .from('orders')
  .select('*')
  .eq('customer_phone', phone); // Parameterized
```

## 8. Error Handling

### Never Expose Internal Errors

```typescript
// ❌ BAD - Exposes internal details
catch (error) {
  res.json({ error: error.message }); // Could leak DB schema, etc.
}

// ✅ GOOD - Generic error message
catch (error) {
  console.error(error); // Log server-side only
  res.json({ error: 'An error occurred. Please try again.' });
}
```

### What to Log
- ✅ Detailed errors (server-side only)
- ✅ Request metadata (IP, timestamp)
- ✅ Validation failures
- ❌ Sensitive data (passwords, keys)
- ❌ Personal information (in production)

## 9. PCI-DSS Compliance

### Card Data Handling
**NEVER** store card data on our servers:
- ❌ Card numbers
- ❌ CVV
- ❌ Expiry dates

### What We Store
- ✅ Razorpay order IDs
- ✅ Razorpay payment IDs
- ✅ Order details
- ✅ Customer contact info

### Razorpay Compliance
Razorpay is **PCI Level 1 certified**. All card data handled by Razorpay, not our servers.

## 10. HTTPS/SSL

### Requirements
- ✅ All traffic over HTTPS
- ✅ SSL certificate (automatic on Vercel)
- ✅ HSTS header (automatic on Vercel)
- ✅ Secure cookies (if using sessions)

## 11. Rate Limiting

### Recommended (Not Implemented)
Add rate limiting to prevent abuse:

```typescript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // Max 100 requests per IP
});
```

**Vercel Pro** includes DDoS protection.

## 12. Security Checklist

### Before Going Live

- ✅ All secrets in environment variables (never in code)
- ✅ `.env` file in `.gitignore`
- ✅ RLS enabled on all Supabase tables
- ✅ Webhook signature verification working
- ✅ Payment signature verification working
- ✅ Server-side price verification working
- ✅ Input validation on all endpoints
- ✅ Error messages don't expose internals
- ✅ HTTPS enabled (automatic on Vercel)
- ✅ Test with invalid signatures (should fail)
- ✅ Test with manipulated prices (should fail)
- ✅ Test with invalid inputs (should reject)

### Production Security

- ✅ Use production Razorpay keys (after KYC)
- ✅ Rotate keys regularly
- ✅ Monitor logs for suspicious activity
- ✅ Set up error monitoring (Sentry, etc.)
- ✅ Enable database backups
- ✅ Review access logs monthly

## 13. Testing Security

### Test Invalid Signatures
```bash
curl -X POST https://yoursite.vercel.app/api/verify-payment \
  -H "Content-Type: application/json" \
  -d '{
    "razorpay_order_id": "order_xxx",
    "razorpay_payment_id": "pay_xxx",
    "razorpay_signature": "invalid_signature"
  }'

# Expected: 400 Bad Request
```

### Test Price Manipulation
```bash
curl -X POST https://yoursite.vercel.app/api/create-order \
  -H "Content-Type: application/json" \
  -d '{
    "items": [{"id": "biryani", "price": 1, "quantity": 1}]
  }'

# Expected: Order created with server price (₹399), not ₹1
```

### Test RLS
```javascript
// Try accessing another user's order
const { data } = await supabase
  .from('orders')
  .select('*')
  .eq('customer_phone', 'someone_else_phone');

// Expected: Empty array (RLS blocks access)
```

## 14. Incident Response

### If Security Breach Suspected

1. **Immediate Actions**
   - Rotate all API keys
   - Check logs for suspicious activity
   - Disable affected accounts

2. **Investigation**
   - Review all logs
   - Identify breach scope
   - Document timeline

3. **Remediation**
   - Fix vulnerability
   - Deploy fix
   - Notify affected users (if required by law)

4. **Post-Incident**
   - Update security measures
   - Document lessons learned
   - Improve monitoring

## Summary

This system implements **industry-standard security practices**:

1. ✅ Cryptographic verification (HMAC-SHA256)
2. ✅ Server-side price validation
3. ✅ Input sanitization and validation
4. ✅ Database Row Level Security
5. ✅ Secret isolation (backend only)
6. ✅ PCI-DSS compliance (via Razorpay)
7. ✅ Webhook signature verification
8. ✅ Timing-safe comparisons
9. ✅ Idempotent operations
10. ✅ Secure error handling

**This is production-ready code** that follows security best practices.

---

For questions, review the code comments or open a GitHub issue.
