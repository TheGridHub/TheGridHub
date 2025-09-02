# TaskGrid AWS Serverless Deployment Guide

This guide will help you deploy TaskGrid to AWS serverless infrastructure using the free tier.

## 🆓 Free Tier Usage

### What's Included FREE:
- **Lambda**: 1M requests/month + 400K GB-seconds
- **DynamoDB**: 25GB storage + 25 units read/write capacity  
- **API Gateway**: 1M API calls/month
- **S3**: 5GB storage + 20K GET + 2K PUT requests
- **CloudFront**: 50GB data transfer + 2M HTTP requests
- **SES**: 62K emails/month

### Estimated Costs After Free Tier:
- **Small App (1K users)**: ~$5-10/month
- **Medium App (10K users)**: ~$50-100/month
- **Large App (100K users)**: ~$300-500/month

## 📋 Prerequisites

1. **AWS Account** with admin access
2. **AWS CLI** installed and configured
3. **AWS SAM CLI** installed
4. **Node.js 18+** installed
5. **Stripe Account** with API keys

## 🚀 Deployment Steps

### 1. Install AWS Tools

```bash
# Install AWS CLI
curl "https://awscli.amazonaws.com/awscli-exe-windows-x86_64.msi" -o "AWSCLIV2.msi"
msiexec /i AWSCLIV2.msi

# Install SAM CLI
pip install aws-sam-cli

# Configure AWS credentials
aws configure
```

### 2. Prepare Your Environment

```bash
cd aws/
npm init -y
npm install aws-sdk stripe uuid
```

### 3. Set Environment Variables

Create `samconfig.toml`:

```toml
version = 0.1
[default]
[default.deploy]
[default.deploy.parameters]
stack_name = "taskgrid-prod"
s3_bucket = "taskgrid-deploy-bucket-unique-name"
s3_prefix = "taskgrid"
region = "us-east-1"
parameter_overrides = [
    "StripeSecretKey=sk_live_...",
    "StripeWebhookSecret=whsec_...",
    "FrontendUrl=https://yourdomain.com",
    "ClerkSecretKey=sk_..."
]
```

### 4. Deploy the Stack

```bash
# Build the application
sam build

# Deploy to AWS
sam deploy --guided

# For subsequent deployments
sam deploy
```

### 5. Update Frontend Configuration

Update your Next.js app to use the API Gateway URLs:

```typescript
// lib/config.ts
export const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://your-api-id.execute-api.us-east-1.amazonaws.com/prod'
  : 'http://localhost:3000'

// Replace all /api/ calls with API_BASE_URL + '/api/'
```

### 6. Configure Stripe Webhooks

1. Go to Stripe Dashboard → Webhooks
2. Add endpoint: `https://your-api-id.execute-api.us-east-1.amazonaws.com/prod/api/stripe/webhooks`
3. Select events:
   - `customer.subscription.created`
   - `customer.subscription.updated` 
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
4. Copy webhook secret to AWS Parameter Store

### 7. Deploy Frontend

Deploy your Next.js app to **Vercel** (also free tier):

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables
vercel env add NEXT_PUBLIC_API_URL
vercel env add STRIPE_PUBLISHABLE_KEY
vercel env add CLERK_PUBLISHABLE_KEY
```

## 🔧 Cost Optimization Tips

### 1. DynamoDB Optimization
```javascript
// Use batch operations to reduce requests
const batchWrite = {
  RequestItems: {
    [tableName]: items.map(item => ({
      PutRequest: { Item: item }
    }))
  }
};
await dynamodb.batchWrite(batchWrite).promise();
```

### 2. Lambda Cold Starts
```javascript
// Keep connections alive
let dynamodbClient;

exports.handler = async (event) => {
  if (!dynamodbClient) {
    dynamodbClient = new AWS.DynamoDB.DocumentClient();
  }
  // ... rest of handler
};
```

### 3. S3 Storage Classes
```yaml
FileStorageBucket:
  Type: AWS::S3::Bucket
  Properties:
    LifecycleConfiguration:
      Rules:
        - Status: Enabled
          Transitions:
            - TransitionInDays: 30
              StorageClass: STANDARD_IA
            - TransitionInDays: 365
              StorageClass: GLACIER
```

## 📊 Monitoring & Alerts

### 1. CloudWatch Alarms

```yaml
BillingAlarm:
  Type: AWS::CloudWatch::Alarm
  Properties:
    AlarmDescription: "Billing exceeds $10"
    MetricName: EstimatedCharges
    Namespace: AWS/Billing
    Statistic: Maximum
    Period: 21600
    EvaluationPeriods: 1
    Threshold: 10
    ComparisonOperator: GreaterThanThreshold
```

### 2. Usage Tracking

```javascript
// Add to Lambda functions
const AWS = require('aws-sdk');
const cloudwatch = new AWS.CloudWatch();

// Track custom metrics
await cloudwatch.putMetricData({
  Namespace: 'TaskGrid',
  MetricData: [{
    MetricName: 'UserActions',
    Value: 1,
    Unit: 'Count',
    Dimensions: [{
      Name: 'Action',
      Value: actionType
    }]
  }]
}).promise();
```

## 🔄 CI/CD Pipeline

### GitHub Actions Workflow

```yaml
# .github/workflows/deploy.yml
name: Deploy to AWS
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup AWS SAM
        uses: aws-actions/setup-sam@v2
        
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v2
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1
          
      - name: Build and deploy
        run: |
          cd aws/
          sam build
          sam deploy --no-confirm-changeset
```

## 🛡️ Security Best Practices

### 1. IAM Policies
```json
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Action": [
      "dynamodb:PutItem",
      "dynamodb:GetItem",
      "dynamodb:UpdateItem",
      "dynamodb:DeleteItem",
      "dynamodb:Query"
    ],
    "Resource": "arn:aws:dynamodb:*:*:table/TaskGrid-*",
    "Condition": {
      "ForAllValues:StringEquals": {
        "dynamodb:LeadingKeys": ["${aws:userid}"]
      }
    }
  }]
}
```

### 2. Environment Variables
```bash
# Use AWS Systems Manager Parameter Store
aws ssm put-parameter \
  --name "/taskgrid/stripe/secret" \
  --value "sk_live_..." \
  --type "SecureString"
```

## 🚨 Troubleshooting

### Common Issues

1. **Cold Start Timeouts**
   - Increase Lambda timeout to 30s
   - Use connection pooling
   - Pre-warm critical functions

2. **DynamoDB Throttling**
   - Use exponential backoff
   - Implement batch operations
   - Consider on-demand billing

3. **API Gateway Limits**
   - Enable caching for GET requests
   - Use compression
   - Implement rate limiting

### Debug Commands

```bash
# View logs
sam logs -n SubscriptionFunction --tail

# Local testing  
sam local start-api

# Validate template
sam validate
```

## 📈 Scaling Strategy

### Phase 1: Free Tier (0-1K users)
- Use all default settings
- Monitor usage closely

### Phase 2: Growth (1K-10K users)  
- Enable DynamoDB autoscaling
- Add CloudFront caching
- Implement connection pooling

### Phase 3: Scale (10K+ users)
- Multiple regions
- Reserved capacity for DynamoDB
- Lambda provisioned concurrency

## 💡 Next Steps

After deployment:

1. **Set up monitoring** with CloudWatch dashboards
2. **Configure backup** for DynamoDB tables
3. **Implement CI/CD** with GitHub Actions
4. **Add custom domain** with Route 53
5. **Enable SSL/TLS** with Certificate Manager

This serverless setup will keep your costs near $0 initially and scale efficiently as you grow!
