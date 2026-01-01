# Complete Setup Guide 🚀

This guide will walk you through setting up the restaurant ordering system from scratch.

## Prerequisites

- Node.js 18+ installed
- pnpm installed (`npm install -g pnpm`)
- Razorpay account (test mode)
- Supabase account (free tier)
- Vercel account (free tier)
- Git installed

## Step 1: Clone Repository

```bash
git clone https://github.com/unknownfriend00007/RESTURANT-1.git
cd RESTURANT-1
```

## Step 2: Install Dependencies

```bash
pnpm install
```

## Step 3: Razorpay Setup

### 3.1 Create Razorpay Account

1. Go to [Razorpay Dashboard](https://dashboard.razorpay.com/signup)
2. Sign up for a free account
3. Complete KYC (for production) or use test mode

### 3.2 Get API Keys

1. Navigate to **Settings** → **API Keys**
2. Click **Generate Test Keys**
3. Copy:
   - **Key ID** (starts with `rzp_test_`)
   - **Key Secret** (keep this SECRET!)

### 3.3 Setup Webhook

1. Navigate to **Settings** → **Webhooks**
2. Click **Create New Webhook**
3. Enter webhook URL: `https://yoursite.vercel.app/api/webhook`
4. Select events:
   - ✅ `payment.captured`
   - ✅ `payment.failed`
   - ✅ `order.paid`
5. Click **Create Webhook**
6. Copy the **Webhook Secret** (starts with `whsec_`)

**Note**: Update webhook URL after deploying to Vercel.

## Step 4: Supabase Setup

### 4.1 Create Supabase Project

1. Go to [Supabase Dashboard](https://app.supabase.com/)
2. Click **New Project**
3. Enter:
   - Name: `restaurant-ordering`
   - Database Password: (save this!)
   - Region: Choose closest to your users
4. Click **Create Project** (takes ~2 minutes)

### 4.2 Get API Keys

1. Navigate to **Settings** → **API**
2. Copy:
   - **Project URL** (e.g., `https://xxx.supabase.co`)
   - **anon public** key
   - **service_role** key (keep this SECRET!)

### 4.3 Setup Database

1. Navigate to **SQL Editor**
2. Click **New Query**
3. Copy the entire contents of `database/schema.sql`
4. Paste into the SQL editor
5. Click **Run**
6. Verify tables created: **Database** → **Tables**

### 4.4 Enable Row Level Security

1. Navigate to **Authentication** → **Policies**
2. Verify RLS policies are enabled on:
   - ✅ `orders` table
   - ✅ `menu_items` table

## Step 5: Environment Variables

### 5.1 Create .env File

```bash
cp .env.example .env
```

### 5.2 Fill in Values

Edit `.env` with your keys:

```env
# Razorpay
RAZORPAY_KEY_ID=rzp_test_YOUR_KEY_ID
VITE_RAZORPAY_KEY_ID=rzp_test_YOUR_KEY_ID
RAZORPAY_KEY_SECRET=YOUR_SECRET_KEY
RAZORPAY_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET

# Supabase
SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
SUPABASE_ANON_KEY=YOUR_ANON_KEY
VITE_SUPABASE_ANON_KEY=YOUR_ANON_KEY
SUPABASE_SERVICE_KEY=YOUR_SERVICE_ROLE_KEY

# App
VITE_APP_NAME=Your Restaurant Name
VITE_APP_URL=http://localhost:3000
```

## Step 6: Test Locally

### 6.1 Start Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000)

### 6.2 Test Order Flow

1. Browse menu
2. Add items to cart
3. Proceed to checkout
4. Fill in customer details
5. Use test card: `4111 1111 1111 1111`
   - CVV: Any 3 digits
   - Expiry: Any future date
6. Complete payment
7. Verify order in Supabase dashboard

## Step 7: Deploy to Vercel

### 7.1 Install Vercel CLI

```bash
npm install -g vercel
```

### 7.2 Login to Vercel

```bash
vercel login
```

### 7.3 Deploy

```bash
vercel --prod
```

### 7.4 Set Environment Variables

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Navigate to **Settings** → **Environment Variables**
4. Add all variables from `.env` (one by one)
5. **Important**: Set for all environments (Production, Preview, Development)

### 7.5 Update Razorpay Webhook URL

1. Go to Razorpay Dashboard → Webhooks
2. Edit webhook URL to: `https://yoursite.vercel.app/api/webhook`
3. Save

### 7.6 Update App URL

1. In Vercel dashboard, update `VITE_APP_URL` to your production URL
2. Redeploy: `vercel --prod`

## Step 8: Verify Production

### 8.1 Test Complete Flow

1. Visit production URL
2. Test order with Razorpay test card
3. Verify order in Supabase
4. Check webhook logs in Razorpay dashboard

### 8.2 Verify Security

- ✅ Open browser console → Check no secrets exposed
- ✅ Try manipulating prices → Should fail
- ✅ Test invalid signatures → Should fail
- ✅ Test RLS → Users can only see own orders

## Step 9: Go Live (Production)

### 9.1 Razorpay Production Mode

1. Complete Razorpay KYC verification
2. Generate production API keys
3. Update environment variables in Vercel
4. Update webhook URL
5. Redeploy

### 9.2 Production Checklist

- ✅ KYC completed on Razorpay
- ✅ Production keys configured
- ✅ Webhook working in production
- ✅ SSL certificate active (automatic on Vercel)
- ✅ Custom domain configured (optional)
- ✅ Database backups enabled in Supabase
- ✅ Error monitoring setup (optional: Sentry)

## Troubleshooting

### Payment Not Working

1. Check Razorpay keys are correct
2. Verify webhook signature secret
3. Check API logs in Vercel dashboard
4. Verify Razorpay dashboard for errors

### Database Errors

1. Verify RLS policies are correct
2. Check service role key is set correctly
3. Review Supabase logs

### Build Errors

1. Clear cache: `rm -rf node_modules dist && pnpm install`
2. Check TypeScript errors: `pnpm type-check`
3. Verify all environment variables are set

## Support

For issues:
- Check [SECURITY.md](./SECURITY.md) for security questions
- Review code comments for detailed explanations
- Open GitHub issue for bugs

---

**Next Steps**: Read [SECURITY.md](./SECURITY.md) to understand security implementation.
