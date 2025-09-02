# 🚀 TaskWork AWS Serverless Setup Guide

## Prerequisites ✅
- [x] Node.js 18+ (you have v22.18.0) ✅
- [x] npm (you have v10.9.3) ✅
- [x] Dependencies installed ✅
- [x] AWS infrastructure ready ✅

## AWS Serverless Architecture

**🏗️ Your TaskWork app uses enterprise-grade AWS infrastructure:**
- **🖥️ Frontend**: Next.js on Lambda + CloudFront CDN
- **🗄️ Database**: AWS RDS PostgreSQL (Aurora Serverless v2)
- **📁 Storage**: S3 bucket for file uploads
- **⚡ Background Jobs**: Scheduled Lambda functions
- **🌐 Domain**: Route53 DNS + SSL certificates
- **🔒 Security**: VPC, Security Groups, encrypted secrets

## Choose Your Deployment Method

### 🚀 AWS Serverless (Recommended for Production)
**Perfect for:**
- Production applications
- Enterprise customers
- Auto-scaling requirements
- High availability needs

**Benefits:**
- ✅ Scales automatically (0 to millions of users)
- ✅ Pay only for what you use
- ✅ Enterprise-grade security and compliance
- ✅ 99.99% uptime SLA
- ✅ Global CDN for fast performance
- ✅ Automated backups and disaster recovery

### 🏠 Local Development (For Testing)
**Perfect for:**
- Development and testing
- Learning the codebase
- Quick prototyping

## 🚀 AWS Serverless Deployment

### 1. Install AWS CLI
```bash
# Download from: https://aws.amazon.com/cli/
# Or using chocolatey on Windows:
choco install awscli
```

### 2. Configure AWS Account
```bash
aws configure
# Enter your AWS credentials
```

### 3. Verify AWS Setup
```bash
npm run aws:check
```

### 4. Set up Clerk Authentication
1. Go to https://clerk.com
2. Create account and application
3. Copy your keys

### 5. Configure AWS Secrets
```bash
# Interactive setup for Clerk + enterprise integrations
npm run aws:secrets dev
```

### 6. Deploy to AWS
```bash
# Deploy development environment
npm run sst:deploy:dev
```

### 7. Set up Database
```bash
# Database URL is auto-configured by AWS
npm run db:push
```

### 8. Access Your App
Your app will be live at: **https://dev.taskwork.io**

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
