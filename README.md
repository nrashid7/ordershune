# OrderShune

OrderShune is an AI WhatsApp-first courier assistant for Bangladeshi f-commerce sellers. It converts messy customer messages, screenshots, and voice notes into structured orders, then prepares courier-ready parcel data for Pathao, REDX, Steadfast, Delivery Tiger, and other Bangladesh courier services.

## Features

- Web dashboard for order management, courier setup, and history
- WhatsApp bot backend for text, image, and audio order extraction
- AI order extraction with Bangla/Banglish/English support
- OCR and speech-to-text abstractions with mock fallbacks
- Courier adapter layer with mock booking until real APIs are connected

## Prerequisites

- Node.js 20+
- npm
- Supabase account (or Supabase CLI for local dev)
- Optional: OpenAI API key, WhatsApp Business Cloud API credentials

## Setup

### 1. Clone and install

```bash
git clone <your-repo>
cd bebsha
npm install
```

### 2. Supabase setup

1. Create a Supabase project at https://supabase.com
2. Copy your project URL and anon key
3. Apply migrations:

```bash
npx supabase login
npx supabase link --project-ref <your-project-ref>
npx supabase db push
```

Or run the SQL files manually in the Supabase SQL editor:

- `supabase/migrations/20260530100000_initial_schema.sql`
- `supabase/migrations/20260530100001_seed_demo.sql`

### 3. Environment variables

Copy `.env.example` to `.env.local` and fill in values:

```bash
cp .env.example .env.local
```

Required for auth/dashboard:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (required for WhatsApp webhook seller lookup)

Optional integrations:

- `OPENAI_API_KEY` — real AI extraction (mock heuristics used if missing)
- `WHATSAPP_VERIFY_TOKEN`, `WHATSAPP_ACCESS_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID`
- `OCR_PROVIDER`, `OCR_API_KEY`
- `SPEECH_PROVIDER`, `SPEECH_API_KEY`
- Courier credential placeholders (`PATHAO_*`, `REDX_API_KEY`, etc.)

### 4. Local development

```bash
npm run dev
```

Open http://localhost:3000

Flow:

1. Sign up at `/signup`
2. Complete onboarding (`/onboarding`)
3. Create orders at `/orders/new`
4. Manage orders at `/orders`
5. Configure couriers at `/settings/courier`

## WhatsApp webhook setup

1. Create a Meta Developer app with WhatsApp Business Cloud API
2. Set webhook URL to:

```
https://<your-domain>/api/whatsapp/webhook
```

3. Set verify token to match `WHATSAPP_VERIFY_TOKEN`
4. Subscribe to `messages`
5. For local testing, use ngrok:

```bash
ngrok http 3000
```

6. Register seller phone in onboarding — bot matches sellers by `profiles.phone`

## Mock mode

OrderShune works end-to-end without external credentials:

| Integration | Mock behavior |
|-------------|---------------|
| OpenAI | Regex/heuristic extraction |
| OCR | Returns sample Banglish order text |
| Speech | Returns sample Bangla transcript |
| WhatsApp send | Logs reply to server console |
| Courier APIs | Returns mock tracking IDs via adapters |

Set providers explicitly in `.env.local`:

```env
OCR_PROVIDER=mock
SPEECH_PROVIDER=mock
```

## Courier integration notes

Courier logic lives in `lib/couriers/`:

- `types.ts` — shared adapter interface
- `pathao.ts`, `redx.ts`, `steadfast.ts`, `deliveryTiger.ts` — provider adapters
- `index.ts` — adapter registry

Each adapter exposes:

- `createParcel(order, config)`
- `getStatus(parcelId, config)`
- `cancelParcel(parcelId, config)`
- `calculateCharge(order, config)`

When credentials are missing, adapters return mock responses. Replace mock implementations with real API calls without changing dashboard or webhook structure.

## Demo seed data

Seed migration inserts demo data when auth user `00000000-0000-4000-8000-000000000001` exists.

For local testing:

1. Create a Supabase Auth user
2. Optionally update the UUID in `supabase/migrations/20260530100001_seed_demo.sql`
3. Re-run seed migration

Sample orders include text, screenshot OCR, voice transcript, missing info, and courier-ready examples.

## Production deployment

### Vercel (recommended)

1. Push the repo to GitHub and import in [Vercel](https://vercel.com)
2. Set environment variables from `.env.example` in the Vercel project settings
3. Set `NEXT_PUBLIC_APP_URL` to your production domain
4. Deploy — build command: `npm run build`, output: Next.js default
5. Point your WhatsApp webhook to `https://<your-domain>/api/whatsapp/webhook`
6. Set `WHATSAPP_APP_SECRET` for webhook signature verification in production

### Health check

Monitor `GET /api/health` — returns `200` when Supabase is reachable.

### Security checklist

- Supabase RLS enabled on all tables (see migrations)
- API routes require authentication via proxy session checks
- WhatsApp webhook verifies `X-Hub-Signature-256` when `WHATSAPP_APP_SECRET` is set
- Security headers configured in `next.config.ts`
- File uploads limited to 10 MB with MIME type validation

## Production roadmap

- [x] Connect real WhatsApp Business Cloud API sending (when credentials set)
- [x] Connect real Pathao, REDX, Steadfast, Delivery Tiger APIs (when credentials set)
- [x] Add billing/subscription (Stripe)
- [x] Add team accounts
- [x] Add Messenger integration
- [x] Add Instagram DM integration
- [x] Add customer database / repeat buyer profiles
- [x] Add COD tracking and reconciliation
- [x] Add delivery status notifications
- [x] Add bulk order import (CSV)
- [x] Add courier charge comparison
- [x] Encrypt courier credentials at rest (set `CREDENTIALS_ENCRYPTION_KEY`)

### New routes

| Route | Purpose |
|-------|---------|
| `/customers` | Repeat buyer CRM |
| `/cod` | COD reconciliation |
| `/notifications` | Delivery & courier alerts |
| `/settings/profile` | Edit shop & WhatsApp phone |
| `/settings/billing` | Stripe plans |
| `/settings/team` | Team invites |
| `/settings/channels` | Messenger & Instagram |
| `/settings/courier/compare` | Rate comparison |
| `/forgot-password` | Password reset |
| `/pricing`, `/privacy`, `/terms` | Marketing & legal |
| `GET /api/cron/sync-courier-status` | Courier status sync (Bearer `CRON_SECRET`) |

## Scripts

```bash
npm run dev      # Start dev server
npm run build    # Production build
npm run start    # Start production server
npm run lint     # ESLint
```

## Architecture

- **Next.js App Router** — dashboard + API routes
- **Supabase** — auth, Postgres, RLS, storage bucket `order_uploads`
- **WhatsApp webhook** — `/api/whatsapp/webhook`
- **Order extraction** — `/api/extract-order`
- **Media processing** — `/api/media-process`

Focus: messy customer input → structured order → courier-ready output.
