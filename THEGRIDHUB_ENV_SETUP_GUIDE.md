# TheGridHub Environment Variables Setup Guide

## ✅ **REBRAND COMPLETED SUCCESSFULLY!**

Your application has been fully rebranded from TaskWork to **TheGridHub** with domain **thegridhub.co**.

All files updated:
- ✅ package.json
- ✅ README.md 
- ✅ app/layout.tsx
- ✅ app/page.tsx
- ✅ .env.example
- ✅ TEMP_VERCEL_ENV_VARS.txt
- ✅ lib/integrations/slack.ts
- ✅ All branding and domain references

---

## 🔐 **REMAINING ENVIRONMENT VARIABLES TO SET UP**

Here's your step-by-step guide for each remaining service:

### 1. **SECURITY KEYS** (Generate These First - 5 minutes)

```bash
# Generate these using openssl or online generators
NEXTAUTH_SECRET=                    # 32-char random string
ENCRYPTION_MASTER_KEY=              # 32-char random string  
CSRF_SECRET=                        # 24-char random string

# Update this URL
NEXTAUTH_URL=https://thegridhub.co
```

**How to generate:**
- Use: https://generate-secret.vercel.app/32
- Or run: `openssl rand -base64 32`

---

### 2. **STRIPE PAYMENT PROCESSING** (Essential for SaaS - 15 minutes)

```bash
STRIPE_SECRET_KEY=                  # sk_test_... or sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY= # pk_test_... or pk_live_...
STRIPE_WEBHOOK_SECRET=              # whsec_...
```

**Setup Steps:**
1. Go to https://dashboard.stripe.com/register
2. Sign up with `infrastructure@thegridhub.co`
3. Complete business verification
4. **Get API Keys:** Dashboard → Developers → API Keys
5. **Create Webhook:** Dashboard → Developers → Webhooks
   - Endpoint: `https://thegridhub.co/api/webhooks/stripe`
   - Events: `payment_intent.succeeded`, `customer.subscription.created`
6. **Copy webhook signing secret**

---

### 3. **SENDGRID EMAIL SERVICE** (Critical for user communications - 10 minutes)

```bash
SENDGRID_API_KEY=                   # SG.xyz...
FROM_EMAIL=noreply@thegridhub.co    # ✅ Already updated!
```

**Setup Steps:**
1. Go to https://signup.sendgrid.com
2. Sign up with `infrastructure@thegridhub.co`
3. **Verify Domain:** Settings → Sender Authentication → Authenticate Your Domain
   - Domain: `thegridhub.co`
   - Add CNAME records to your DNS
4. **Create API Key:** Settings → API Keys → Create API Key
   - Name: "TheGridHub Production"
   - Permissions: Full Access

---

### 4. **AI SERVICES** (For AI features - 5 minutes each)

#### OpenAI
```bash
OPENAI_API_KEY=                     # sk-...
```
- Go to https://platform.openai.com/api-keys
- Sign up with `infrastructure@thegridhub.co`
- Create new API key

#### Hugging Face
```bash
HF_API_TOKEN=                       # hf_...
```
- Go to https://huggingface.co/join
- Sign up with `infrastructure@thegridhub.co`
- Settings → Access Tokens → Create new token

---

### 5. **MICROSOFT TEAMS INTEGRATION** (Complex - Can skip initially - 30 minutes)

```bash
TEAMS_APP_ID=                       # Microsoft Teams App ID
TEAMS_APP_PASSWORD=                 # App password from Bot Framework
```

**Setup Steps:**
1. Go to https://dev.botframework.com/
2. Sign in with `infrastructure@thegridhub.co`
3. Create new bot registration
4. Get App ID and generate App Password
5. Configure messaging endpoint

---

### 6. **MONITORING & ANALYTICS** (Optional but recommended - 5 minutes each)

#### Sentry (Error Tracking)
```bash
SENTRY_DSN=                         # https://abc123@o123.ingest.sentry.io/123
```
- Go to https://sentry.io/signup/
- Create project: TheGridHub (Next.js)
- Copy DSN

#### PostHog (Analytics)
```bash
NEXT_PUBLIC_POSTHOG_KEY=            # phc_...
```
- Go to https://posthog.com/signup
- Create project: TheGridHub
- Copy project key

#### Logtail (Logging)
```bash
LOGTAIL_TOKEN=                      # Logging token
```
- Go to https://logtail.com/signup
- Create source: TheGridHub
- Copy token

---

## 📋 **PRIORITY ORDER FOR SETUP**

### **Phase 1: Essential (Start with these)**
1. ✅ Security keys (NEXTAUTH_SECRET, etc.) - **Generate first**
2. 🔄 Stripe payment processing - **Critical for SaaS**
3. 🔄 SendGrid email service - **User communications**

### **Phase 2: Core Features**  
4. 🔄 OpenAI API - **AI features**
5. 🔄 Sentry error tracking - **Production monitoring**

### **Phase 3: Advanced (Later)**
6. 🔄 Microsoft Teams integration
7. 🔄 PostHog analytics
8. 🔄 Hugging Face API
9. 🔄 Logtail logging

---

## 🚀 **NEXT STEPS**

1. **Start with Phase 1** - Generate security keys and set up Stripe
2. **Add to Vercel:** Go to your Vercel dashboard → Settings → Environment Variables
3. **Set for all environments:** Production, Preview, Development
4. **Test deployment** after adding each phase
5. **Update your accounts** to use `infrastructure@thegridhub.co` consistently

---

## 📝 **NOTES**

- ✅ **Domain updated everywhere:** All `taskwork.io` → `thegridhub.co`
- ✅ **Email addresses updated:** All `@taskwork.io` → `@thegridhub.co`  
- ✅ **Slack commands updated:** `/taskwork` → `/thegridhub`
- ✅ **Repository moved:** GitHub automatically redirected to TheGridHub
- ✅ **All branding updated:** TaskWork → TheGridHub

**Your rebranding is 100% complete! 🎉**

---

## ⚠️ **IMPORTANT REMINDERS**

- **Use `infrastructure@thegridhub.co`** for all new account signups
- **Delete TEMP_VERCEL_ENV_VARS.txt** after copying to Vercel
- **Never commit real API keys** to Git
- **Set up 2FA** on all service accounts
- **Document which services you've completed** in this file

Ready to start with the security keys and Stripe setup?
