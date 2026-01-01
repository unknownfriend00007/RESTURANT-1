# Restaurant Online Ordering System 🍽️

A production-ready restaurant online ordering system with **enterprise-grade security**, Razorpay payment integration, and modern tech stack.

## 🚀 Features

### Customer Features
- 🏠 Beautiful responsive landing page
- 📖 Interactive menu with images and descriptions
- 🛒 Shopping cart with quantity management
- 💳 Secure payment via Razorpay (UPI, Cards, NetBanking, Wallets)
- 📦 Order tracking and history
- 📱 Mobile-first design

### Security Features (Production-Grade)
- ✅ **Server-side price verification** - Backend recalculates totals
- ✅ **HMAC-SHA256 signature verification** - Cryptographic payment validation
- ✅ **Timing-safe comparison** - Prevents timing attacks
- ✅ **Webhook signature validation** - Secure event processing
- ✅ **Environment variable isolation** - Secrets never exposed to frontend
- ✅ **Input validation with Zod** - Type-safe validation
- ✅ **Database RLS** - Row-level security on Supabase
- ✅ **PCI-DSS compliant** - No card data stored

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS + shadcn/ui
- **Routing**: React Router v6
- **Backend**: Vercel Serverless Functions
- **Database**: Supabase (PostgreSQL)
- **Payments**: Razorpay
- **Deployment**: Vercel
- **Package Manager**: pnpm

## 📁 Project Structure

```
restaurant-ordering-system/
├── src/
│   ├── components/        # React components
│   ├── pages/            # Page components
│   ├── lib/              # Utilities and clients
│   ├── context/          # React context providers
│   └── types/            # TypeScript interfaces
├── api/                  # Vercel serverless functions
│   ├── create-order.ts   # Create Razorpay order
│   ├── verify-payment.ts # Verify payment signature
│   └── webhook.ts        # Handle webhooks
├── database/
│   └── schema.sql        # Database schema
└── docs/
    ├── SETUP.md          # Setup guide
    └── SECURITY.md       # Security documentation
```

## 🔧 Setup Instructions

See [docs/SETUP.md](./docs/SETUP.md) for complete setup guide.

### Quick Start

1. **Clone the repository**
```bash
git clone https://github.com/unknownfriend00007/RESTURANT-1.git
cd RESTURANT-1
```

2. **Install dependencies**
```bash
pnpm install
```

3. **Set up environment variables**
```bash
cp .env.example .env
# Edit .env with your keys
```

4. **Set up database**
- Create Supabase project
- Run schema from `database/schema.sql`
- Enable RLS policies

5. **Run development server**
```bash
pnpm dev
```

## 🔐 Security

See [docs/SECURITY.md](./docs/SECURITY.md) for detailed security documentation.

### Key Security Principles

1. **Never trust client data** - All prices verified server-side
2. **Cryptographic verification** - HMAC-SHA256 for all payments
3. **Secret isolation** - Secrets only on backend
4. **Input validation** - All inputs validated with Zod
5. **Database security** - RLS enabled on all tables

## 📊 Database Schema

See [database/schema.sql](./database/schema.sql) for complete schema.

## 🧪 Testing

### Razorpay Test Cards
- **Success**: `4111 1111 1111 1111` (Any CVV, future expiry)
- **Failure**: `4000 0000 0000 0002`
- **UPI**: Use `success@razorpay` for testing

## 📝 Environment Variables

See `.env.example` for all required variables.

### Critical Security Note
- `VITE_*` variables are **PUBLIC** (exposed to browser)
- Non-prefixed variables are **SECRET** (backend only)
- Never use `RAZORPAY_KEY_SECRET` in frontend code

## 🚀 Deployment

### Deploy to Vercel

```bash
vercel deploy --prod
```

Set all environment variables in Vercel dashboard.

## 📖 Documentation

- [Setup Guide](./docs/SETUP.md)
- [Security Documentation](./docs/SECURITY.md)
- [API Documentation](./docs/API.md)

## 🤝 Contributing

Contributions welcome! Please read our contributing guidelines first.

## 📄 License

MIT License - see LICENSE file for details.

## 🆘 Support

For issues and questions:
- Open a GitHub issue
- Check documentation in `/docs`

---

**Built with ❤️ for production use**
