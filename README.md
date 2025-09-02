# TaskGrid - AI-Powered Task Management Platform

TaskGrid is a comprehensive task management platform designed to optimize productivity, track project progress, and ensure team collaboration. Built with Next.js 14, **100% FREE AI integration**, and modern technologies.

## ✨ Key Features

- **📊 Real-time Dashboard** - Visual performance metrics and project insights
- **🎯 Task Management** - Create, organize, and track tasks with progress visualization  
- **🤖 FREE AI-Powered** - Smart task suggestions using Puter.js (no API keys needed!)
- **📈 Performance Analytics** - Team productivity tracking and deadline monitoring
- **🎨 Modern UI** - Clean, responsive design matching professional standards
- **🔐 Secure Authentication** - Powered by Clerk with sign-in/sign-up pages
- **💾 Database Integration** - PostgreSQL with Prisma ORM
- **💰 Freemium Model** - Personal (free), Pro ($12/mo), Enterprise ($25/mo) plans
- **🚫 Plan Limitations** - Smart upgrade prompts when limits are reached
- **🌐 Landing Page** - Professional marketing site with pricing
- **💼 Enterprise Contact** - Dedicated sales page for large organizations
- **🌍 Auto Currency Conversion** - Detects user location and shows prices in local currency
- **📊 Dynamic Dashboard** - Auto-populates with real task and performance data

## 🆓 Free AI Integration

**No expensive API keys required!** TaskGrid uses:

- **[Puter.js](https://puter.com)** - Free access to GPT-4o, GPT-5, DALL-E and more
- **[Hugging Face](https://huggingface.co)** - Free open-source models as backup
- **LocalAI** - Optional self-hosted solution

## 🌍 Global Features

- **Auto-Detection** - Automatically detects user's country and currency
- **20+ Currencies** - Supports major world currencies with real-time exchange rates
- **Free APIs** - Uses completely free location and currency services
- **Seamless UX** - Currency picker with country flags and auto-detection

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Frontend:** React, TypeScript, Tailwind CSS  
- **Backend:** Next.js API Routes
- **Database:** PostgreSQL (Neon)
- **ORM:** Prisma
- **Authentication:** Clerk
- **AI Integration:** Puter.js (FREE!), Hugging Face (FREE!)
- **Location/Currency:** ipapi.co + exchangerate.host (both FREE!)
- **Charts:** Recharts
- **Deployment:** Vercel

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm/pnpm/yarn/bun
- PostgreSQL database (recommended: Neon)

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd taskgrid
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   pnpm install
   # or
   bun install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Fill in your environment variables:
   ```env
   # Database
   DATABASE_URL="postgresql://username:password@host:5432/database?schema=public"
   
   # Clerk Authentication
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
   CLERK_SECRET_KEY=sk_test_...
   
   # AI is FREE with Puter.js - No API keys needed!
   # Location & Currency are FREE - No API keys needed!
   ```

4. **Set up the database**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🚀 Quick Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/taskgrid)

## Database Setup with Neon

1. Go to [Neon Console](https://console.neon.tech)
2. Create a new project
3. Copy the connection string
4. Add it to your `.env` file as `DATABASE_URL`

## Authentication Setup with Clerk

1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Create a new application
3. Copy the publishable and secret keys
4. Add them to your `.env` file

## 🤖 AI Features (100% FREE!)

### Puter.js Integration
TaskGrid uses Puter.js for completely free AI capabilities:

- **GPT-4o & GPT-5** access without API keys
- **Task suggestions** based on project context
- **Progress analysis** and insights
- **Schedule optimization**
- **No usage limits or costs**

The AI script is automatically loaded and ready to use!

### AI Features Include:

#### Smart Task Suggestions
```javascript
// AI analyzes your project and suggests relevant tasks
const suggestions = await generateTaskSuggestions(
  'E-commerce website redesign',
  existingTaskTitles
)
```

#### Progress Analysis
Get intelligent insights about project progress and risks.

#### Schedule Optimization  
AI-powered task scheduling based on priority and dependencies.

## 🌍 Dynamic Features

### Auto-Location Detection & Currency Conversion
- Detects user location via IP automatically
- Shows pricing in local currency with real exchange rates
- Supports 20+ major currencies worldwide
- Updates rates daily for accuracy

### Dynamic Dashboard Metrics
- **Team Performance** - Calculated from actual task completion rates
- **Upcoming Deadlines** - Real count of tasks due in next 7 days
- **Task Completion** - Live breakdown by project with visual charts
- **Performance Charts** - Generated from real 7-day activity data
- **Smart Goals** - Auto-generated based on user productivity patterns

## Project Structure

```
taskgrid/
├── app/                    # Next.js 14 app directory
│   ├── (auth)/            # Authentication pages
│   ├── (dashboard)/       # Protected dashboard
│   ├── contact/           # Enterprise contact page
│   ├── api/               # API routes
│   │   ├── tasks/         # Task management
│   │   ├── ai/            # AI suggestions
│   │   ├── location/      # Auto location detection
│   │   └── currency/      # Currency conversion
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout (includes Puter.js)
│   └── page.tsx           # Landing page
├── components/            # React components
│   ├── Sidebar.tsx
│   ├── DashboardHeader.tsx
│   ├── StatsCards.tsx
│   ├── TaskTable.tsx
│   ├── GoalsSection.tsx
│   ├── PricingModal.tsx
│   ├── CurrencyConverter.tsx
│   ├── AISuggestions.tsx  # FREE AI suggestions
│   └── PerformanceChart.tsx
├── lib/                   # Utilities
│   ├── prisma.ts          # Database client
│   ├── ai.ts              # FREE AI integrations
│   ├── location-currency.ts # Location & currency utils
│   ├── dashboard-utils.ts # Dynamic dashboard calculations
│   └── utils.ts           # Helper functions
├── prisma/
│   └── schema.prisma      # Database schema
└── ...config files
```

## API Endpoints

- `GET /api/tasks` - Get user tasks
- `POST /api/tasks` - Create new task
- `POST /api/ai/suggestions` - Get FREE AI task suggestions
- `GET /api/location` - Auto-detect user location
- `GET /api/currency` - Convert currency with real rates

## 💡 Why TaskGrid?

### Cost Benefits
- **$0** for AI features (competitors charge $20+/month)
- **$0** for location/currency features
- **Free tier** sufficient for most small teams
- **No hidden costs** for core functionality

### Dynamic Features
- Dashboard auto-populates with real user data
- Currency automatically adapts to user's location
- Performance metrics calculated from actual usage
- Goals adapt to user productivity patterns

### Feature Comparison
| Feature | TaskGrid | Competitors |
|---------|----------|-------------|
| AI Task Suggestions | ✅ FREE | 💰 $20-50/month |
| Auto Currency Detection | ✅ FREE | ❌ Not available |
| Dynamic Dashboard | ✅ Included | ❌ Static only |
| Global Pricing | ✅ 20+ currencies | ❌ USD only |
| Team Collaboration | ✅ Included | ✅ Included |
| **Total Monthly Cost** | **$0-12** | **$25-100+** |

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | ✅ Yes |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk public key | ✅ Yes |
| `CLERK_SECRET_KEY` | Clerk secret key | ✅ Yes |
| ~~`OPENAI_API_KEY`~~ | ~~OpenAI API key~~ | ❌ **NOT NEEDED** |
| ~~`LOCATION_API_KEY`~~ | ~~Location API key~~ | ❌ **NOT NEEDED** |
| ~~`CURRENCY_API_KEY`~~ | ~~Currency API key~~ | ❌ **NOT NEEDED** |

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npx prisma studio` - Open Prisma Studio
- `npx prisma generate` - Generate Prisma client
- `npx prisma db push` - Push schema changes

## 🎯 Perfect Dashboard Match

TaskGrid's interface **dynamically** matches professional task management with:

- ✅ Team performance metrics (calculated from real completion rates)
- ✅ Upcoming deadlines counter (real count of tasks due)  
- ✅ Task completion tracking (live breakdown by project)
- ✅ Interactive task table with progress bars
- ✅ Goals section with auto-generated targets
- ✅ Modern sidebar with project navigation
- ✅ Professional color scheme and typography
- ✅ Currency adaptation based on user location

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## Support

If you encounter any issues:

1. Check the [GitHub Issues](https://github.com/yourusername/taskgrid/issues)
2. Review the documentation
3. Contact support at support@taskgrid.com

## License

This project is licensed under the MIT License.

---

**Built with ❤️ using Next.js, React, and 100% FREE integrations**

**🌍 Global-ready • 🤖 AI-powered • 💰 Cost-effective • 📊 Data-driven**