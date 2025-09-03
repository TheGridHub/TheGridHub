# 🚀 TaskWork Production Deployment Checklist

## Pre-Deployment Requirements

### 1. ✅ Clerk Authentication Setup
- [ ] Create account at https://clerk.com
- [ ] Create a new application
- [ ] Get your API keys from Dashboard > API Keys
  - Publishable Key (starts with `pk_`)
  - Secret Key (starts with `sk_`)

### 2. ✅ Supabase Database Setup
- [ ] Create account at https://supabase.com
- [ ] Create a new project
- [ ] Get your database connection string
- [ ] Note down your project URL and anon key

### 3. ✅ Vercel Account
- [ ] Vercel account (free tier available)
- [ ] Vercel CLI installed (`npm install -g vercel`)
- [ ] Connected to your Git repository

## Deployment Steps

### Step 1: Set up Database Schema
```bash
# Push your Prisma schema to Supabase
npm run db:push
```

### Step 2: Deploy to Vercel
```bash
# Connect your repository and deploy
vercel

# Follow the prompts to:
# - Link to existing project or create new
# - Set up custom domain (optional)
```

### Step 3: Configure Environment Variables
In your Vercel dashboard (vercel.com):
1. Go to your project
2. Settings → Environment Variables
3. Add all variables from your `.env.local`:
   - `DATABASE_URL`
   - `DIRECT_URL`
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - `CLERK_SECRET_KEY`
   - All other optional integrations

### Step 4: Redeploy with Environment Variables
```bash
# Trigger a new deployment with environment variables
vercel --prod
```

### Step 5: Configure Custom Domain (Optional)
1. In Vercel dashboard → Domains
2. Add your custom domain (e.g., taskwork.io)
3. Follow DNS configuration instructions
4. SSL certificate is automatically provisioned

## Common Issues & Solutions

### Issue: "Environment Variables Not Found"
**Solution**: Make sure all environment variables are set in Vercel dashboard

### Issue: Database Connection Error
**Solution**: 
1. Verify DATABASE_URL is correct in Vercel env vars
2. Check if Supabase project is active
3. Ensure IP restrictions allow Vercel (usually not needed)

### Issue: Build Failing
**Solution**:
1. Check build logs in Vercel dashboard
2. Ensure all dependencies are in package.json
3. Verify TypeScript types are correct

### Issue: Custom Domain Not Working
**Solution**: 
1. Check DNS propagation (can take up to 48 hours)
2. Verify DNS records match Vercel instructions
3. SSL certificate is automatically managed by Vercel

## Post-Deployment

### Monitor Your App
- **Vercel Analytics**: Built-in performance monitoring
- **Vercel Logs**: Real-time function logs
- **Supabase Dashboard**: Database metrics and logs

### Update Your App
```bash
# Make changes to your code
git add .
git commit -m "Update"
git push

# Vercel automatically redeploys on git push
# Or manually trigger: vercel --prod
```

### Database Updates
```bash
# Update database schema
npm run db:push

# View database
npm run db:studio
```

## Cost Estimates

### Free Tier (Perfect for Testing)
- **Vercel**: 100GB bandwidth, unlimited sites
- **Supabase**: 500MB database, 2GB bandwidth
- **Total**: $0/month

### Production (Paid Plans)
- **Vercel Pro**: $20/month (team features, analytics)
- **Supabase Pro**: $25/month (8GB database, 100GB bandwidth)
- **Total**: ~$45/month for production apps

## Need Help?

1. **Vercel Docs**: https://vercel.com/docs
2. **Supabase Docs**: https://supabase.com/docs
3. **Vercel Dashboard**: Real-time logs and metrics
4. **Clerk Dashboard**: Authentication issues and user management

