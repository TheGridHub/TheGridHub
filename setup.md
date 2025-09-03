# 🚀 TaskWork Vercel + Supabase Setup Guide

## Prerequisites ✅
- [x] Node.js 18+ (you have v22.18.0) ✅
- [x] npm (you have v10.9.3) ✅
- [x] Dependencies installed ✅
- [x] Vercel CLI installed ✅

## Modern Architecture

**🏗️ Your TaskWork app uses modern, scalable infrastructure:**
- **🖥️ Frontend**: Next.js on Vercel Edge Network
- **🗄️ Database**: Supabase PostgreSQL (globally distributed)
- **📁 Storage**: Supabase Storage for file uploads
- **⚡ Background Jobs**: Vercel Cron Jobs
- **🌐 Domain**: Vercel custom domains + SSL
- **🔒 Security**: Vercel security headers + Supabase RLS

## Choose Your Deployment Method

### 🚀 Vercel + Supabase (Recommended for Production)
**Perfect for:**
- Production applications
- Startups and enterprises
- Auto-scaling requirements
- Global performance

**Benefits:**
- ✅ Scales automatically (0 to millions of users)
- ✅ Pay only for what you use
- ✅ Enterprise-grade security and compliance
- ✅ 99.99% uptime SLA
- ✅ Global CDN and edge functions
- ✅ Automated backups and point-in-time recovery

### 🏠 Local Development (For Testing)
**Perfect for:**
- Development and testing
- Learning the codebase
- Quick prototyping

## 🚀 Vercel + Supabase Deployment

### 1. Install Vercel CLI
```bash
# Install Vercel CLI globally
npm install -g vercel
```

### 2. Create Supabase Project
1. Go to https://supabase.com
2. Sign up with GitHub
3. Create new project
4. Wait for database to be ready (~2 minutes)
5. Go to Settings → Database
6. Copy the connection string (URI)

### 3. Set up Clerk Authentication
1. Go to https://clerk.com
2. Create account and application
3. Copy your keys

### 4. Configure Environment Variables
```bash
# Copy environment template
cp .env.example .env.local

# Edit with your actual values
# - Supabase DATABASE_URL
# - Clerk keys
```

### 5. Deploy to Vercel
```bash
# Deploy to Vercel
vercel

# Add environment variables in Vercel dashboard
# Settings → Environment Variables
```

### 6. Set up Database
```bash
# Push database schema
npm run db:push
```

### 7. Access Your App
Your app will be live at your Vercel URL

---

## 🏠 Local Development Alternative

### 1. Set up Local Database
**Option A: Railway (Free)**
1. Go to https://railway.app → New Project → PostgreSQL
2. Copy DATABASE_URL to `.env`

**Option B: Local PostgreSQL**
1. Install PostgreSQL
2. Create `taskwork` database
3. Update `.env`: `DATABASE_URL="postgresql://user:pass@localhost:5432/taskwork"`

### 2. Configure Clerk Authentication
1. Get keys from https://clerk.com
2. Update `.env`:
```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_key
CLERK_SECRET_KEY=sk_test_your_secret
```

### 3. Start Local Development
```bash
npm run db:push  # Set up database
npm run dev      # Start development server
```
Access at: **http://localhost:3000**

## Optional Integrations (Can be added later)

### Microsoft Office 365
1. Go to https://portal.azure.com
2. App registrations → New registration
3. Add redirect URI: `http://localhost:3000/api/auth/microsoft`
4. Update `.env`:
```
MICROSOFT_CLIENT_ID=your_client_id
MICROSOFT_CLIENT_SECRET=your_client_secret
MICROSOFT_TENANT_ID=your_tenant_id
```

### Google Workspace  
1. Go to https://console.cloud.google.com
2. Create project → Enable APIs
3. Create OAuth 2.0 credentials
4. Update `.env`:
```
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

### Slack Integration
1. Go to https://api.slack.com/apps
2. Create new app
3. Install app to workspace
4. Update `.env`:
```
SLACK_CLIENT_ID=your_slack_client_id
SLACK_CLIENT_SECRET=your_slack_client_secret
SLACK_SIGNING_SECRET=your_slack_signing_secret
SLACK_BOT_TOKEN=xoxb-your-token
```

## Quick Start Commands

```bash
# Install dependencies (already done ✅)
npm install

# Generate Prisma client (already done ✅)
npx prisma generate

# Push database schema (run after database setup)
npm run db:push

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run database studio (optional)
npm run db:studio
```

## Verification Checklist

- [ ] Database URL configured in `.env`
- [ ] Clerk keys configured in `.env`  
- [ ] Database schema pushed: `npm run db:push`
- [ ] Development server running: `npm run dev`
- [ ] Website accessible at http://localhost:3000

## Troubleshooting

### Database Connection Issues
```bash
# Test database connection
npx prisma db pull
```

### Build Issues
```bash
# Clear cache and reinstall
npm run clean && npm install
```

### Authentication Issues
- Verify Clerk keys in dashboard
- Check domain configuration in Clerk
- Ensure redirect URLs match

## Next Steps After Setup

1. **Access your app** at http://localhost:3000
2. **Sign up/Sign in** using Clerk
3. **Create your first project**
4. **Add team members**
5. **Configure integrations** (optional)

## Support

- 📧 Email: support@taskwork.io
- 💬 Discord: [Join our community](https://discord.gg/taskwork)
- 📖 Docs: [docs.taskwork.io](https://docs.taskwork.io)

