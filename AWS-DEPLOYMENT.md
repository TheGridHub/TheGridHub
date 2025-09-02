# 🚀 TaskWork AWS Serverless Deployment Guide

## Infrastructure Overview

Your TaskWork application will be deployed to AWS with the following architecture:

- **🖥️ Frontend**: Next.js on AWS Lambda + CloudFront CDN
- **🗄️ Database**: AWS RDS PostgreSQL (Aurora Serverless v2)
- **🔧 API Routes**: AWS Lambda functions
- **📁 File Storage**: S3 bucket for uploads
- **⚡ Background Jobs**: Lambda functions with CloudWatch Events
- **🌐 Domain**: Route53 DNS + SSL certificates
- **🔒 Security**: VPC, Security Groups, IAM roles

## Prerequisites

### 1. Install AWS CLI
```bash
# Download from: https://aws.amazon.com/cli/
# Or using chocolatey on Windows:
choco install awscli
```

### 2. Configure AWS Account
```bash
aws configure
# Enter your:
# - AWS Access Key ID
# - AWS Secret Access Key  
# - Default region: us-east-1
# - Default output format: json
```

### 3. Verify AWS Configuration
```bash
npm run aws:check
```

## Step-by-Step Deployment

### Step 1: Set up Clerk Authentication
1. Go to https://clerk.com
2. Create account and new application
3. Copy your keys from the dashboard
4. Keep them handy for the next step

### Step 2: Configure Secrets
```bash
# This will prompt you for Clerk keys and optional integrations
npm run aws:secrets dev
```

The script will ask for:
- **Required**: Clerk Publishable Key & Secret Key
- **Optional**: Microsoft, Google, Slack integration keys

### Step 3: Deploy to AWS (Development)
```bash
# Deploy development environment
npm run sst:deploy:dev
```

This will create:
- ✅ VPC with public/private subnets
- ✅ RDS PostgreSQL database (Aurora Serverless)
- ✅ Lambda functions for Next.js app
- ✅ S3 bucket for file storage
- ✅ CloudFront distribution
- ✅ API Gateway for additional endpoints
- ✅ Background job Lambda functions
- ✅ CloudWatch scheduled events

### Step 4: Run Database Migrations
```bash
# The database URL is automatically configured by SST
npx sst secret set DATABASE_URL "$(sst resource get DATABASE_URL)" --stage dev
npm run db:push
```

### Step 5: Test Your Deployment
- Your app will be available at: `https://dev.taskwork.io`
- Database admin: `npm run db:studio`
- Monitor logs: Check AWS CloudWatch

### Step 6: Deploy to Production
```bash
# Set production secrets
npm run aws:secrets production

# Deploy production
npm run sst:deploy
```

Production will be available at: `https://taskwork.io`

## Domain Configuration

### Option A: Use Your Own Domain
1. Purchase domain (e.g., `yourdomain.com`)
2. Create hosted zone in Route53
3. Update nameservers at your registrar
4. Update `sst.config.ts`:
   ```typescript
   domain: {
     name: "yourdomain.com",
     redirects: ["www.yourdomain.com"],
   }
   ```

### Option B: Use Provided Subdomain
The deployment automatically creates:
- Dev: `https://dev.taskwork.io`
- Prod: `https://taskwork.io`

## Environment Configuration

### Local Development (.env)
```bash
# For local development with AWS services
DATABASE_URL="postgresql://local_url"
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
AWS_REGION=us-east-1
```

### AWS Deployment (Automatic)
SST automatically configures:
- Database connection from RDS
- Secrets from AWS Systems Manager
- Environment variables per stage
- VPC networking and security groups

## Cost Estimation

### Development Environment (~$15-30/month)
- RDS Aurora Serverless: ~$15/month (0.5 ACU)
- Lambda: ~$1/month (first 1M requests free)
- CloudFront: ~$1/month (first 1TB free)
- S3: ~$1/month (first 5GB free)
- Route53: $0.50/month per hosted zone

### Production Environment (~$50-100/month)
- RDS Aurora Serverless: ~$40/month (2-4 ACU average)
- Lambda: ~$5/month 
- CloudFront: ~$5/month
- S3: ~$2/month
- Route53: $0.50/month
- NAT Gateway: ~$45/month

## Monitoring & Maintenance

### CloudWatch Dashboards
```bash
# View application logs
aws logs describe-log-groups --log-group-name-prefix "/aws/lambda/taskwork"
```

### Database Monitoring
```bash
# Connect to database studio
npm run db:studio

# View database metrics in AWS console
# RDS > Aurora > TaskworkDatabase > Monitoring
```

### Background Jobs
Background jobs run daily at 2 AM UTC:
- Database cleanup
- Notification digests  
- Analytics updates
- Integration syncing

### Scaling
Aurora Serverless automatically scales:
- **Min**: 0.5 ACU (1 GB RAM, 2 vCPU)
- **Max**: 16 ACU (32 GB RAM, 16 vCPU)
- **Auto-pause**: After 5 minutes of inactivity

## Troubleshooting

### Deployment Issues
```bash
# View deployment status
sst status --stage dev

# View resources
sst resource list --stage dev

# Debug specific resource
sst resource get TaskworkDatabase --stage dev
```

### Database Connection Issues
```bash
# Test database connection
npx prisma db pull

# Reset database schema
npx prisma db push --force-reset
```

### Lambda Cold Starts
- First request may be slow (2-5 seconds)
- Subsequent requests are fast (<100ms)
- Consider provisioned concurrency for production

### SSL Certificate Issues
- SSL certificates are automatically created
- DNS validation may take 5-10 minutes
- Check Route53 hosted zone records

## Security Features

### Network Security
- ✅ VPC with private subnets for database
- ✅ Security groups allowing only necessary traffic
- ✅ NAT Gateway for outbound internet access
- ✅ No direct internet access to database

### Application Security
- ✅ SSL/TLS encryption in transit
- ✅ Database encryption at rest
- ✅ IAM roles with minimal permissions
- ✅ Secrets stored in AWS Systems Manager
- ✅ CloudFront with security headers

### Compliance
- ✅ SOC 2 Type II (AWS infrastructure)
- ✅ GDPR compliant (data deletion)
- ✅ Regular security updates
- ✅ Audit logs in CloudTrail

## CLI Commands Reference

```bash
# AWS Setup
npm run aws:setup          # Configure AWS CLI
npm run aws:check          # Verify AWS configuration
npm run aws:secrets [stage] # Set up application secrets

# SST Deployment
npm run sst:dev            # Start local development with AWS
npm run sst:deploy:dev     # Deploy to development
npm run sst:deploy         # Deploy to production
npm run sst:remove         # Remove all AWS resources

# Database
npm run db:push            # Update database schema
npm run db:studio          # Open database admin
npm run db:generate        # Generate Prisma client

# Development
npm run dev                # Local development
npm run build              # Build for production
npm run start              # Start production build locally
```

## Next Steps After Deployment

1. **✅ Verify deployment** at your domain
2. **✅ Test user registration** and login
3. **✅ Create sample projects** and tasks
4. **✅ Test enterprise integrations** (if configured)
5. **✅ Set up monitoring alerts** in CloudWatch
6. **✅ Configure backup strategy** for database
7. **✅ Set up CI/CD pipeline** with GitHub Actions

## Support

- 📧 **Email**: aws-support@taskwork.io
- 💬 **Discord**: [Join our community](https://discord.gg/taskwork)
- 📖 **Documentation**: [docs.taskwork.io/aws](https://docs.taskwork.io/aws)
- 🎥 **Video Tutorial**: [YouTube AWS Deployment](https://youtube.com/taskwork)
