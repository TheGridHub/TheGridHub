# TheGridHub Deployment Guide

## Overview

This guide covers deploying TheGridHub to production using Vercel and Supabase.

## Prerequisites

- Node.js 18+ installed
- Supabase account and project
- Vercel account (recommended) or alternative hosting platform
- Stripe account (for payments)
- Domain name (optional but recommended)

## Environment Variables

### Required Environment Variables

Create a `.env.local` file for local development and set these variables in your production environment:

#### Supabase Configuration
```bash
# Supabase API Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
SUPABASE_SECRET_KEY=your_supabase_secret_key

# Legacy support (will be deprecated)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

#### Database Configuration
```bash
# Supabase Database URLs
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres?pgbouncer=true&connection_limit=1"
DIRECT_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"
```

#### Application Settings
```bash
# Application Configuration
NEXT_PUBLIC_APP_URL=https://your-domain.com
NEXT_PUBLIC_APP_NAME=TheGridHub
NEXT_PUBLIC_COMPANY_NAME=TheGridHub
NEXT_PUBLIC_DOMAIN=your-domain.com
```

#### Security
```bash
# Internal Admin Access (Change these!)
THEGRIDHUB_ADMIN=admin
THEGRIDHUB_ADMIN_PW=your_secure_admin_password
THEGRIDHUB_OPERATOR=operator
THEGRIDHUB_OPERATOR_PW=your_secure_operator_password

# Encryption Key (Generate a secure random key)
ENCRYPTION_MASTER_KEY=your_32_character_encryption_key
```

#### Storage (Optional)
```bash
# S3-compatible storage (Supabase Storage)
STORAGE_S3_ENDPOINT=https://your-project.storage.supabase.co/storage/v1/s3
STORAGE_S3_REGION=us-east-1
STORAGE_S3_BUCKET=thegridhub_bucket
STORAGE_S3_ACCESS_KEY_ID=your_access_key
STORAGE_S3_SECRET_ACCESS_KEY=your_secret_key
STORAGE_S3_FORCE_PATH_STYLE=true
```

#### Integrations (Optional)
```bash
# Microsoft Office 365
MICROSOFT_CLIENT_ID=your_microsoft_client_id
MICROSOFT_CLIENT_SECRET=your_microsoft_client_secret
MICROSOFT_TENANT_ID=your_tenant_id

# Google Workspace
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=https://your-app.com/api/integrations/google/callback

# Slack Integration
SLACK_CLIENT_ID=your_slack_client_id
SLACK_CLIENT_SECRET=your_slack_client_secret
SLACK_SIGNING_SECRET=your_slack_signing_secret
SLACK_BOT_TOKEN=your_slack_bot_token

# Jira Integration
JIRA_CLIENT_ID=your_jira_client_id
JIRA_CLIENT_SECRET=your_jira_client_secret
JIRA_DOMAIN=yourcompany.atlassian.net
JIRA_EMAIL=you@yourcompany.com

# Teams Integration
TEAMS_APP_ID=your_teams_app_id
TEAMS_APP_PASSWORD=your_teams_app_password
```

## Supabase Setup

### 1. Database Schema

Execute the SQL schema located in `supabase/schema.sql` in your Supabase SQL editor:

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy and paste the contents of `supabase/schema.sql`
4. Execute the SQL to create all tables, policies, and functions

### 2. Authentication Settings

Configure authentication in Supabase Dashboard:

1. Go to Authentication → Settings
2. Configure Site URL: `https://your-domain.com`
3. Add Redirect URLs:
   - `https://your-domain.com/auth/callback`
   - `http://localhost:3000/auth/callback` (for development)

### 3. Storage Setup (Optional)

If using file uploads:

1. Go to Storage
2. Create a bucket named `thegridhub_bucket`
3. Set up appropriate policies for file access

### 4. Row Level Security

Ensure RLS is enabled and working:
- All tables should have RLS enabled
- Test with different user roles to ensure proper access control
- Verify team-based data isolation

## Vercel Deployment

### 1. Connect Repository

1. Go to [Vercel Dashboard](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Configure build settings:
   - Framework Preset: Next.js
   - Build Command: `npm run build`
   - Output Directory: `.next`

### 2. Environment Variables

Add all environment variables in Vercel Dashboard:

1. Go to Project Settings → Environment Variables
2. Add each variable from your `.env.local`
3. Make sure to set the correct values for production

### 3. Domain Configuration

1. Go to Project Settings → Domains
2. Add your custom domain
3. Configure DNS records as instructed by Vercel

## Testing Checklist

### Pre-Deployment Testing

- [ ] All environment variables are set correctly
- [ ] Database schema is applied successfully
- [ ] Authentication flow works (sign up, sign in, sign out)
- [ ] Team creation and management works
- [ ] Project and task CRUD operations work
- [ ] Real-time updates are functioning
- [ ] File uploads work (if enabled)
- [ ] Email notifications are sent
- [ ] Payment processing works (if enabled)
- [ ] All API endpoints respond correctly
- [ ] Error handling displays proper messages
- [ ] Loading states are shown appropriately

### Post-Deployment Testing

- [ ] Production app loads correctly
- [ ] SSL certificate is working
- [ ] All features work in production environment
- [ ] Database connections are stable
- [ ] Performance is acceptable (run Lighthouse audit)
- [ ] Error monitoring is working
- [ ] Backup systems are in place

### Accessibility Testing

- [ ] Screen reader compatibility
- [ ] Keyboard navigation works
- [ ] Color contrast meets WCAG guidelines
- [ ] Focus indicators are visible
- [ ] Alt text for images is present

### Performance Testing

- [ ] Core Web Vitals pass
- [ ] First Contentful Paint < 2s
- [ ] Largest Contentful Paint < 2.5s
- [ ] Cumulative Layout Shift < 0.1
- [ ] First Input Delay < 100ms

## Security Checklist

### Authentication & Authorization

- [ ] JWT tokens are properly validated
- [ ] Row Level Security policies are working
- [ ] Admin routes are protected
- [ ] API endpoints validate user permissions
- [ ] Session management is secure

### Data Protection

- [ ] Sensitive data is encrypted at rest
- [ ] API keys are not exposed to client
- [ ] Database credentials are secure
- [ ] User input is properly sanitized
- [ ] CORS is properly configured

### Infrastructure

- [ ] HTTPS is enforced
- [ ] Security headers are set
- [ ] Rate limiting is in place
- [ ] Database backups are automated
- [ ] Monitoring and alerting is configured

## Monitoring & Maintenance

### Error Tracking

Consider integrating error tracking services:
- Sentry
- LogRocket
- Rollbar

### Analytics

Set up analytics to track:
- User engagement
- Feature usage
- Performance metrics
- Error rates

### Backup Strategy

1. **Database Backups**: Supabase provides automatic backups
2. **Code Backups**: Repository is backed up on GitHub
3. **Environment Variables**: Keep encrypted backups of production configs

### Update Process

1. Test all changes in staging environment
2. Run full test suite before deployment
3. Deploy during low-traffic periods
4. Monitor application after deployment
5. Have rollback plan ready

## Troubleshooting

### Common Issues

1. **Environment Variable Issues**
   - Verify all required variables are set
   - Check for typos in variable names
   - Ensure values don't have extra spaces

2. **Database Connection Issues**
   - Verify DATABASE_URL format
   - Check Supabase project status
   - Confirm IP allowlisting if applicable

3. **Authentication Issues**
   - Verify Supabase auth configuration
   - Check redirect URLs
   - Confirm JWT settings

4. **Build Issues**
   - Clear Next.js cache: `npm run build --debug`
   - Check TypeScript errors
   - Verify all dependencies are installed

### Getting Help

- Check Supabase documentation
- Review Next.js deployment guide
- Check Vercel deployment docs
- Review application logs
- Check browser console for client-side errors

## Production Optimization

### Performance

- Enable caching headers
- Optimize images with Next.js Image component
- Use appropriate loading strategies
- Implement service workers for offline support

### SEO

- Configure proper meta tags
- Set up sitemap.xml
- Implement structured data
- Optimize for Core Web Vitals

### Maintenance

- Set up automated dependency updates
- Monitor security vulnerabilities
- Regular performance audits
- User feedback collection

## Rollback Plan

If issues occur after deployment:

1. **Immediate Rollback**
   - Revert to previous Vercel deployment
   - Roll back database migrations if needed

2. **Investigation**
   - Check error logs
   - Review recent changes
   - Test in staging environment

3. **Fix and Redeploy**
   - Apply fixes
   - Test thoroughly
   - Deploy with monitoring

Remember to keep this documentation updated as the application evolves!
