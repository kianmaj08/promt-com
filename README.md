# Prompt.com

A community platform for high-quality AI prompts — built with Next.js 14, Supabase, Clerk, and Gemini 1.5 Flash.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Database**: Supabase (PostgreSQL)
- **Auth**: Clerk
- **AI**: Google Gemini 1.5 Flash
- **Styling**: Tailwind CSS
- **Deployment**: Vercel

## Features

- 🔍 Browse & search 15+ prompt categories
- ⭐ AI-powered quality rating via Gemini 1.5 Flash
- 🌟 Community ratings & comments
- ⚡ 4-step Prompt Generator with variants
- 🔀 Remix & improve existing prompts
- 📁 Personal collections
- 🏆 Contributor leaderboard
- 🌙 Dark mode

## Quick Start

### 1. Clone & Install

```bash
git clone <your-repo>
cd prompt-com
npm install
```

### 2. Environment Variables

```bash
cp .env.example .env.local
```

Fill in all values in `.env.local`:

| Variable | Where to get it |
|---|---|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | [Clerk Dashboard](https://dashboard.clerk.com) |
| `CLERK_SECRET_KEY` | Clerk Dashboard |
| `NEXT_PUBLIC_SUPABASE_URL` | [Supabase Project Settings](https://app.supabase.com) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Settings → API |
| `GEMINI_API_KEY` | [Google AI Studio](https://aistudio.google.com/app/apikey) |

### 3. Database Setup

1. Go to your Supabase project
2. Open **SQL Editor**
3. Run the contents of `supabase/schema.sql`

This will create all tables, RLS policies, triggers and seed category data.

### 4. Clerk Webhook (optional but recommended)

For auto-syncing users to Supabase:

1. In Clerk Dashboard → Webhooks → Add Endpoint
2. URL: `https://your-domain.com/api/webhooks/clerk`
3. Events: `user.created`, `user.updated`, `user.deleted`

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Project Structure

```
app/
  page.tsx                    # Landing page
  explore/                    # Browse prompts
  prompts/[id]/               # Prompt detail
  submit/                     # Submit prompt
  generator/                  # AI Prompt Generator
  profile/[id]/               # User profile
  leaderboard/                # Top contributors
  collections/                # User collections
  categories/[slug]/          # Category pages
  sign-in/ & sign-up/         # Clerk auth pages
  api/                        # API routes
    prompts/                  # CRUD + save/rate/copy/comments
    evaluate/                 # Gemini evaluation
    generate/                 # Gemini generation
    improve/                  # Gemini improvement
    variants/                 # 3 prompt variants
    collections/              # Collections CRUD
    users/[id]/               # User profiles
    search/                   # Full-text search
    webhooks/clerk/           # Clerk user sync

components/
  ui/           # Button, Input, Modal, Badge, StarRating, ...
  layout/       # Navbar, Footer, Sidebar
  prompts/      # PromptCard, PromptGrid, EvaluationResult, ImprovePrompt, RemixPrompt, ...
  generator/    # GeneratorWizard, VariantSelector, VariablesMode, ImproveMode

lib/
  supabase.ts   # 3 Supabase clients (browser, server, admin)
  gemini.ts     # AI evaluation, generation, improvement
  utils.ts      # Utility functions
  constants.ts  # Categories, AI tools, app constants
  api-helpers.ts # ok(), err(), requireAuth()
```

## AI Evaluation Criteria

Every submitted prompt is scored by Gemini 1.5 Flash across 5 criteria:

| Criterion | Weight | Description |
|---|---|---|
| Clarity | 25% | Clear, unambiguous instructions |
| Completeness | 20% | Context, goal and format included |
| Reusability | 20% | Adaptable for similar tasks |
| Creativity | 15% | Original and inventive approach |
| Specificity | 20% | Sufficient detail for the AI |

**Score thresholds:**
- ≥ 4.5 → Published + Featured ⭐
- ≥ 3.0 → Published ✅
- ≥ 2.0 → Published with note ⚠️
- < 2.0 → Rejected ❌

## Deploy to Vercel

```bash
npm i -g vercel
vercel
```

Or connect your GitHub repo in the [Vercel Dashboard](https://vercel.com).

Set all environment variables in Vercel → Project → Settings → Environment Variables.

---

## License

MIT
