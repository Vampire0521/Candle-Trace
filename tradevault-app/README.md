# 🚀 TradeVault - Professional Trading Journal

> **A comprehensive trading journal and analytics platform built with Next.js 16, Supabase, and modern web technologies.**

![TradeVault](https://img.shields.io/badge/TradeVault-Premium%20Trading%20Journal-8b5cf6?style=for-the-badge)
![Next.js](https://img.shields.io/badge/Next.js-16.1.6-black?style=flat-square&logo=next.js)
![Supabase](https://img.shields.io/badge/Supabase-Database-3ecf8e?style=flat-square&logo=supabase)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178c6?style=flat-square&logo=typescript)

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Database Schema](#-database-schema)
- [API Routes](#-api-routes)
- [Pages & Components](#-pages--components)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Cost Estimates](#-cost-estimates-for-1000-users)
- [Roadmap](#-roadmap)

---

## ✨ Features

### 📊 Core Trading Features
| Feature | Description |
|---------|-------------|
| **Trade Logging** | Log trades with entry/exit prices, quantity, dates, times, and notes |
| **Multi-Asset Support** | Stocks, Crypto, Forex, Options, Futures |
| **Strategy Tracking** | Create and assign strategies to trades |
| **P&L Calculation** | Automatic profit/loss calculation with win rate |
| **Goal Setting** | Set monthly/quarterly/yearly profit goals |

### 📈 Analytics & Charts
| Feature | Description |
|---------|-------------|
| **Dashboard Stats** | Total P&L, Win Rate, Profit Factor, Max Drawdown |
| **P&L Calendar** | Visual calendar heatmap of daily profits/losses |
| **Equity Curve** | Track account growth over time |
| **Time Analytics** | Performance by hour of day and day of week |
| **Distribution Charts** | P&L distribution and trade outcome analysis |

### 🏷️ Organization (Phase 1)
| Feature | Description |
|---------|-------------|
| **Trade Tags** | Create custom tags with colors (e.g., "FOMO", "Good Setup") |
| **MFE/MAE Tracking** | Maximum Favorable/Adverse Excursion for trade analysis |
| **Entry/Exit Times** | Track exact entry and exit times for time-based analysis |
| **Commission/Fees** | Track trading costs per trade |
| **CSV Export** | Export trades to CSV with date filtering |

### 🧠 Psychology & Discipline (Phase 2)
| Feature | Description |
|---------|-------------|
| **Emotion Logger** | Log pre/post trade emotions (Confidence, Fear, Greed, FOMO) |
| **Tiltmeter** | Visual indicator of current emotional trading state |
| **Discipline Score** | Track discipline (1-10) and plan adherence |
| **Mistake Tracking** | Log mistakes: FOMO Entry, Revenge Trade, Overtrading, etc. |
| **Playbook Manager** | Create trading setup templates with rules |

---

## 🛠 Tech Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Frontend** | Next.js 16 (App Router) | React framework with SSR/SSG |
| **Styling** | CSS Modules + CSS Variables | Scoped styling with design tokens |
| **Language** | TypeScript 5.x | Type safety |
| **Database** | Supabase (PostgreSQL) | Managed Postgres with Auth |
| **Auth** | Supabase Auth | Email/password + OAuth |
| **State** | React Hooks + Context | Client state management |
| **Forms** | React Hook Form | Form validation |
| **Animations** | Framer Motion | Smooth UI animations |
| **Charts** | Native Canvas + CSS | Lightweight custom charts |

---

## 🏗 Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT BROWSER                          │
├─────────────────────────────────────────────────────────────────┤
│  Next.js App Router (RSC + Client Components)                  │
│  ├── Server Components (Data Fetching)                         │
│  ├── Client Components (Interactivity)                         │
│  └── API Routes (Backend Logic)                                │
├─────────────────────────────────────────────────────────────────┤
│                        SUPABASE CLOUD                           │
│  ├── PostgreSQL Database (Data Storage)                        │
│  ├── Row Level Security (Data Isolation)                       │
│  ├── Auth (User Management)                                    │
│  └── Storage (Screenshots - Future)                            │
└─────────────────────────────────────────────────────────────────┘
```

### Directory Structure
```
tradevault-app/
├── src/
│   ├── app/
│   │   ├── (auth)/           # Auth pages (login, signup, forgot-password)
│   │   ├── (dashboard)/      # Protected dashboard pages
│   │   │   ├── analytics/    # Analytics and charts
│   │   │   ├── calculator/   # Position size calculator
│   │   │   ├── dashboard/    # Main dashboard
│   │   │   ├── goals/        # Goal tracking
│   │   │   ├── settings/     # User settings + Tag Manager
│   │   │   ├── strategies/   # Strategy management
│   │   │   └── trades/       # Trade log (CRUD)
│   │   └── api/              # API routes
│   │       ├── discipline/   # Discipline stats
│   │       ├── emotions/     # Emotion logging
│   │       ├── export/       # CSV export
│   │       ├── playbook/     # Playbook CRUD
│   │       └── tags/         # Tag management
│   ├── components/
│   │   ├── analytics/        # TimeAnalytics, charts
│   │   ├── export/           # ExportButton
│   │   ├── filters/          # AdvancedFilters
│   │   ├── layout/           # Sidebar, Header
│   │   ├── psychology/       # Tiltmeter, DisciplineScore, EmotionLogger
│   │   ├── tags/             # TagManager
│   │   └── ui/               # Modal, Button, Motion
│   ├── lib/
│   │   ├── supabase/         # Supabase client (server + client)
│   │   └── utils.ts          # Helper functions
│   └── types/
│       └── index.ts          # TypeScript type definitions
├── supabase/
│   └── migrations/           # SQL migration files
└── public/                   # Static assets
```

---

## 🗄 Database Schema

### Core Tables

```
┌─────────────────────────────────────────────────────────────────┐
│                          PROFILES                               │
├─────────────────────────────────────────────────────────────────┤
│ id (UUID, PK, FK → auth.users)                                 │
│ email (TEXT)                                                    │
│ full_name (TEXT)                                               │
│ avatar_url (TEXT)                                              │
│ initial_balance (DECIMAL) - Starting capital                   │
│ currency (TEXT) - USD, EUR, INR, etc.                          │
│ theme (TEXT) - dark/light                                      │
│ created_at, updated_at (TIMESTAMPTZ)                           │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                           TRADES                                │
├─────────────────────────────────────────────────────────────────┤
│ id (UUID, PK)                                                  │
│ user_id (UUID, FK → auth.users)                                │
│ ticker (TEXT) - Symbol (AAPL, BTC, EUR/USD)                    │
│ type (TEXT) - stock/crypto/forex/options/futures               │
│ side (TEXT) - long/short                                       │
│ entry_price, exit_price (DECIMAL)                              │
│ quantity (DECIMAL)                                             │
│ trade_date (DATE)                                              │
│ entry_time, exit_time (TIME) ← Phase 1                         │
│ strategy_id (UUID, FK → strategies)                            │
│ stop_loss, take_profit (DECIMAL)                               │
│ mfe, mae (DECIMAL) ← Phase 1 (Max Favorable/Adverse Excursion)│
│ commission, fees (DECIMAL) ← Phase 1                           │
│ category (TEXT) - scalp/day/swing/position                     │
│ market_condition (TEXT) - bullish/bearish/choppy/ranging       │
│ notes (TEXT)                                                   │
│ screenshot_url (TEXT) ← Phase 1                                │
│ created_at, updated_at (TIMESTAMPTZ)                           │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                         STRATEGIES                              │
├─────────────────────────────────────────────────────────────────┤
│ id (UUID, PK)                                                  │
│ user_id (UUID, FK → auth.users)                                │
│ name (TEXT) - Strategy name                                    │
│ description (TEXT)                                             │
│ icon (TEXT) - Emoji icon                                       │
│ is_active (BOOLEAN)                                            │
│ created_at, updated_at (TIMESTAMPTZ)                           │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                           GOALS                                 │
├─────────────────────────────────────────────────────────────────┤
│ id (UUID, PK)                                                  │
│ user_id (UUID, FK → auth.users)                                │
│ name (TEXT)                                                    │
│ target_amount (DECIMAL)                                        │
│ current_amount (DECIMAL)                                       │
│ goal_type (TEXT) - monthly/quarterly/yearly                    │
│ deadline (DATE)                                                │
│ is_completed (BOOLEAN)                                         │
│ created_at, updated_at (TIMESTAMPTZ)                           │
└─────────────────────────────────────────────────────────────────┘
```

### Phase 1 Tables (Tags)

```
┌─────────────────────────────────────────────────────────────────┐
│                        TRADE_TAGS                               │
├─────────────────────────────────────────────────────────────────┤
│ id (UUID, PK)                                                  │
│ user_id (UUID, FK → auth.users)                                │
│ name (TEXT)                                                    │
│ color (TEXT) - Hex color code                                  │
│ created_at (TIMESTAMPTZ)                                       │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                      TRADE_TAG_LINKS                            │
├─────────────────────────────────────────────────────────────────┤
│ trade_id (UUID, FK → trades, PK)                               │
│ tag_id (UUID, FK → trade_tags, PK)                             │
└─────────────────────────────────────────────────────────────────┘
```

### Phase 2 Tables (Psychology)

```
┌─────────────────────────────────────────────────────────────────┐
│                      TRADE_EMOTIONS                             │
├─────────────────────────────────────────────────────────────────┤
│ id (UUID, PK)                                                  │
│ user_id (UUID, FK → auth.users)                                │
│ trade_id (UUID, FK → trades)                                   │
│ pre_confidence, pre_fear, pre_greed, pre_fomo (INT 1-5)        │
│ post_satisfaction, post_regret (INT 1-5)                       │
│ discipline_score (INT 1-10)                                    │
│ followed_plan (BOOLEAN)                                        │
│ mistakes (TEXT[]) - Array of mistake types                     │
│ notes (TEXT)                                                   │
│ created_at (TIMESTAMPTZ)                                       │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                      PLAYBOOK_SETUPS                            │
├─────────────────────────────────────────────────────────────────┤
│ id (UUID, PK)                                                  │
│ user_id (UUID, FK → auth.users)                                │
│ name (TEXT)                                                    │
│ description (TEXT)                                             │
│ entry_rules (TEXT)                                             │
│ exit_rules (TEXT)                                              │
│ risk_percentage (DECIMAL)                                      │
│ min_rr_ratio (DECIMAL)                                         │
│ timeframes (TEXT[])                                            │
│ market_conditions (TEXT[])                                     │
│ is_active (BOOLEAN)                                            │
│ created_at, updated_at (TIMESTAMPTZ)                           │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                   PRE_TRADE_CHECKLISTS                          │
├─────────────────────────────────────────────────────────────────┤
│ id (UUID, PK)                                                  │
│ user_id (UUID, FK → auth.users)                                │
│ name (TEXT)                                                    │
│ items (JSONB) - Checklist items                                │
│ is_default (BOOLEAN)                                           │
│ created_at (TIMESTAMPTZ)                                       │
└─────────────────────────────────────────────────────────────────┘
```

### Row Level Security (RLS)

All tables use RLS to ensure users can only access their own data:

```sql
-- Example RLS Policy
CREATE POLICY "Users can view own trades"
    ON trades FOR SELECT
    USING (auth.uid() = user_id);
```

---

## 🔌 API Routes

| Endpoint | Methods | Description |
|----------|---------|-------------|
| `/api/tags` | GET, POST | List and create tags |
| `/api/tags/[id]` | GET, PUT, DELETE | Manage individual tags |
| `/api/emotions` | GET, POST | List and create emotion logs |
| `/api/playbook` | GET, POST | List and create playbook setups |
| `/api/playbook/[id]` | GET, PUT, DELETE | Manage individual setups |
| `/api/discipline` | GET | Get discipline statistics |
| `/api/export` | POST | Export trades to CSV |

### Sample API Response

```json
// GET /api/discipline?days=30
{
  "data": {
    "average_discipline": 7.5,
    "plan_adherence": 85.2,
    "trades_with_emotions": 42,
    "total_trades": 50,
    "common_mistakes": [
      { "type": "fomo_entry", "count": 5 },
      { "type": "early_exit", "count": 3 }
    ]
  }
}
```

---

## 📱 Pages & Components

### Dashboard Pages

| Page | Path | Description |
|------|------|-------------|
| Dashboard | `/dashboard` | Stats, P&L Calendar, Equity Curve, Recent Trades |
| Trades | `/trades` | Trade log with filtering, add/edit modal |
| Analytics | `/analytics` | Charts, distributions, time analysis |
| Strategies | `/strategies` | Strategy management |
| Goals | `/goals` | Goal tracking |
| Calculator | `/calculator` | Position size calculator |
| Settings | `/settings` | Profile, preferences, Tag Manager |

### Key Components

| Component | Description |
|-----------|-------------|
| `TradeModal` | Add/Edit trades with Psychology tab |
| `Tiltmeter` | Visual emotional state indicator |
| `DisciplineScore` | Discipline metrics card |
| `TimeAnalytics` | Hour/day performance charts |
| `TagManager` | Create/edit/delete tags |
| `ExportButton` | CSV export with date filter |
| `PnLCalendar` | Monthly P&L heatmap |
| `EquityCurve` | Account balance over time |

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account

### Installation

```bash
# Clone repository
git clone <repository-url>
cd tradevault-app

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your Supabase credentials

# Run migrations in Supabase SQL Editor
# 1. Run: supabase/migrations/initial_schema.sql (if exists)
# 2. Run: supabase/migrations/phase1_foundation_safe.sql
# 3. Run: supabase/migrations/phase2_psychology.sql

# Start development server
npm run dev
```

---

## 🔐 Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Site URL (for auth redirects)
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

---

## 💰 Cost Estimates for 1,000 Users

### Assumptions
- Average 50 trades/user/month = 50,000 trades/month
- Average 5 API requests/user/day = 150,000 API calls/month
- Average storage per user: ~1MB (trade data, no images)

### Supabase Pricing (Primary Cost)

| Plan | Monthly Cost | What You Get |
|------|--------------|--------------|
| **Free** | $0 | 500MB database, 2GB bandwidth, 50,000 auth users |
| **Pro** | $25/month | 8GB database, 250GB bandwidth, unlimited auth |
| **Team** | $599/month | 16GB database, unlimited everything |

### Estimated Monthly Costs

| Users | Database Size | Supabase Plan | Vercel | **Total** |
|-------|---------------|---------------|--------|-----------|
| 100 | ~100MB | Free | Free | **$0** |
| 500 | ~500MB | Free | Free | **$0** |
| **1,000** | ~1GB | **Pro ($25)** | Free | **~$25/month** |
| 5,000 | ~5GB | Pro ($25) | Pro ($20) | **~$45/month** |
| 10,000 | ~10GB | Team ($599) | Pro ($20) | **~$620/month** |

### Detailed Breakdown for 1,000 Users

```
┌────────────────────────────────────────────────────────────────┐
│                    MONTHLY COST BREAKDOWN                      │
├────────────────────────────────────────────────────────────────┤
│ SUPABASE PRO                                                   │
│ ├── Base plan                          $25.00                  │
│ ├── Database storage (1GB included)    $0.00                   │
│ ├── Bandwidth (within 250GB)           $0.00                   │
│ ├── Auth (1000 MAU)                    $0.00                   │
│ └── Realtime (if used)                 $0.00                   │
│                                        ─────                   │
│                                        $25.00                  │
├────────────────────────────────────────────────────────────────┤
│ VERCEL (Hosting)                                               │
│ ├── Hobby Plan (Free)                  $0.00                   │
│ ├── Build minutes (within limit)       $0.00                   │
│ ├── Bandwidth (100GB free)             $0.00                   │
│ └── Serverless functions               $0.00                   │
│                                        ─────                   │
│                                        $0.00                   │
├────────────────────────────────────────────────────────────────┤
│ DOMAIN (Optional)                                              │
│ └── tradevault.com (~$12/year)         $1.00/month             │
├────────────────────────────────────────────────────────────────┤
│ TOTAL FOR 1,000 USERS                  ~$26/month              │
└────────────────────────────────────────────────────────────────┘
```

### What Could Increase Costs

| Scenario | Additional Cost |
|----------|-----------------|
| Image uploads (trade screenshots) | +$0.021/GB storage |
| High traffic spikes | Vercel Pro at $20/month |
| Premium features (AI analysis) | OpenAI API ~$0.01-0.10/request |
| Email notifications | Resend/SendGrid ~$20/month |

### Revenue Opportunity

| Pricing Model | 1,000 paying users | Profit (after costs) |
|---------------|-------------------|----------------------|
| $9.99/month | $9,990/month | **$9,964/month** |
| $19.99/month | $19,990/month | **$19,964/month** |
| $99/year | $8,250/month (avg) | **$8,224/month** |

> 💡 **Key insight**: With costs under $30/month for 1,000 users, even a modest $5/month subscription generates massive profit margins (99%+).

---

## 🗺 Roadmap

### ✅ Completed

- [x] **Phase 0**: Core App (Dashboard, Trades, Strategies, Goals, Analytics)
- [x] **Phase 1**: Foundation (Tags, Time Analysis, Export, MFE/MAE)
- [x] **Phase 2**: Psychology (Emotions, Tiltmeter, Discipline, Playbook)

### 🚧 Upcoming

- [ ] **Phase 3**: AI Engine
  - Trade pattern recognition
  - AI-powered insights
  - Sentiment analysis from notes
  
- [ ] **Phase 4**: Broker Integration
  - Import from TD Ameritrade, IBKR, etc.
  - Auto-sync trades
  
- [ ] **Phase 5**: Social Features
  - Shareable performance cards
  - Leaderboards (opt-in)
  - Community strategies

---

## 📄 License

MIT License - Feel free to use for personal or commercial projects.

---

## 🤝 Contributing

Contributions are welcome! Please read our contributing guidelines before submitting PRs.

---

**Built with ❤️ by the TradeVault Team**
