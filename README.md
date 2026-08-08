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
cd ordershune
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

Or run the SQL files manually in the Supabase SQL editor (in order):

- `supabase/migrations/20260530100000_initial_schema.sql`
- `supabase/migrations/20260530120000_launch_features.sql` — customers, subscriptions, COD, notifications, team orgs, channel integrations, encrypted courier credentials, `orders.customer_id`
- `supabase/migrations/20260530100001_seed_demo.sql`
- `supabase/migrations/20260808100000_channel_capture.sql` — channel conversations/messages, comment capture settings
- `supabase/migrations/20260808110000_team_scoping.sql` — invite tokens, org-scoped orders/customers, auto-accept trigger
- `supabase/migrations/20260808200000_production_hardening.sql` — invite accept RPC, unique active page_id

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

## Messenger & Instagram webhook setup

1. In Meta Developer Console, add Messenger and/or Instagram products
2. Set webhook URLs:
   - Messenger: `https://<your-domain>/api/messenger/webhook`
   - Instagram: `https://<your-domain>/api/instagram/webhook`
3. Subscribe to: `messages`, `messaging_postbacks`, `feed` (Facebook comments), `comments` (Instagram)
4. Configure per-tenant tokens in **Settings → Channels** (Page ID, verify token, access token)
5. Set `META_APP_SECRET` (or `WHATSAPP_APP_SECRET`) for webhook signature verification in production
6. Comment capture: enable in channel settings; public reply + private DM handoff is automatic

## Team invites

1. Create a team at **Settings → Team**
2. Invite members by email — a shareable link is generated
3. Invitee opens `/invite/<token>` and accepts, or auto-joins on signup with matching email

## Shipping labels & manifests

- Print A6 carrier labels from **Order detail → Print label** or bulk **Orders → Print selected**
- Export carrier-shaped CSV manifests via **Orders → Export manifest** for portal upload
- Supported layouts: Pathao, REDX, Steadfast, Delivery Tiger

## Mock mode (local / staging only)

Local development works without external credentials. **Production refuses mock providers** unless `ALLOW_MOCK_PROVIDERS=true` (staging escape hatch only).

| Integration | Dev mock behavior | Production |
|-------------|-------------------|------------|
| OpenAI | Regex/heuristic extraction | Requires `OPENAI_API_KEY` |
| OCR | Sample Banglish order text | Requires `OCR_PROVIDER=google\|ocrspace` |
| Speech | Sample Bangla transcript | Requires `SPEECH_PROVIDER=openai\|google` |
| WhatsApp send | Logs reply to server console | Needs Cloud API tokens |
| Courier booking | Mock tracking IDs | Fails without courier API keys (use labels/manifests) |

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

### Launch checklist (required before go-live)

Apply all migrations including `20260808200000_production_hardening.sql`, then set these on Vercel/production:

| Variable | Why |
|----------|-----|
| `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Auth + dashboard |
| `SUPABASE_SERVICE_ROLE_KEY` | Webhooks, cron, admin lookups |
| `CREDENTIALS_ENCRYPTION_KEY` | Encrypt channel/courier tokens (64-char hex recommended) |
| `OPENAI_API_KEY` | Real order extraction (mock heuristics disabled in production) |
| `META_APP_SECRET` or `WHATSAPP_APP_SECRET` | Webhooks return `503` without signature verification in production |
| `NEXT_PUBLIC_APP_URL` | Invite links, webhook URLs in settings |
| `OCR_PROVIDER` + `OCR_API_KEY` | Required before processing images (mock blocked in production) |
| `SPEECH_PROVIDER` (+ key) | Required before processing voice notes |

Optional but recommended: `SENTRY_DSN`, `NEXT_PUBLIC_SENTRY_DSN`, Stripe keys, `CRON_SECRET`.

Do **not** set `ALLOW_MOCK_PROVIDERS=true` in real production.

### Vercel (recommended)

1. Push the repo to GitHub and import in [Vercel](https://vercel.com)
2. Set environment variables from `.env.example` / the checklist above
3. Set `NEXT_PUBLIC_APP_URL` to your production domain
4. Deploy — Node 20+, build command: `npm run build`
5. Point WhatsApp / Messenger / Instagram webhooks to your domain
6. Activate channels in **Settings → Channels** (Page ID + token + Active)
7. Confirm `GET /api/health` returns `healthy` with empty `productionGaps`

### Health check

`GET /api/health` reports app, Supabase, service role, encryption, OpenAI, Meta signature, OCR, and speech readiness. Production returns `503` when required secrets are missing.

### Security checklist

- Supabase RLS enabled on all tables (see migrations)
- Team invites accepted via `accept_team_invite` SECURITY DEFINER RPC
- Authenticated API routes: extract-order, media-process, orders/import, orders/manifest
- CSV import capped at 1 MB / 500 rows
- Meta/WhatsApp webhooks **fail closed** in production without app secret; invalid signatures → `401`
- Channel/courier secrets refuse plaintext storage when encryption key is missing in production
- Mock OCR/STT/AI extraction and mock courier booking disabled in production
- Security headers configured in `next.config.ts`
- File uploads limited to 10 MB with MIME type validation
- In-process rate limits are best-effort on multi-instance hosts; signatures are the primary webhook control

## Production roadmap

- [x] Connect real WhatsApp Business Cloud API sending (when credentials set)
- [x] Connect real Pathao, REDX, Steadfast, Delivery Tiger APIs (when credentials set)
- [x] Add billing/subscription (Stripe)
- [x] Add team accounts (org + invites with shareable links and auto-accept on signup)
- [x] Add Messenger integration (DM + comment capture, per-tenant tokens, media OCR/STT)
- [x] Add Instagram DM integration (DM + comment capture, per-tenant tokens, media OCR/STT)
- [x] Add customer database / repeat buyer profiles
- [x] Add COD tracking and reconciliation
- [x] Add delivery status notifications
- [x] Add bulk order import (CSV)
- [x] Add shipping label printing (A6 per-carrier templates)
- [x] Add carrier manifest CSV export
- [ ] Add courier charge comparison (UI + API; pricing still heuristic/mock for some couriers)
- [x] Encrypt courier credentials at rest (set `CREDENTIALS_ENCRYPTION_KEY`)

### New routes

| Route | Purpose |
|-------|---------|
| `/inbox` | Captured Messenger/Instagram conversations |
| `/orders/[id]/label` | Print single shipping label |
| `/orders/labels` | Bulk print labels |
| `/invite/[token]` | Accept team invite |
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
| `GET /api/orders/manifest` | Carrier CSV manifest export |
| `GET /api/cron/sync-courier-status` | Courier status sync (Bearer `CRON_SECRET`) |

## Scripts

```bash
npm run dev      # Start dev server
npm run build    # Production build
npm run start    # Start production server
npm run lint     # ESLint
npm run typecheck # TypeScript check
npm test         # Vitest unit tests
```

## Architecture

- **Next.js App Router** — dashboard + API routes
- **Supabase** — auth, Postgres, RLS, storage bucket `order_uploads`
- **WhatsApp webhook** — `/api/whatsapp/webhook`
- **Order extraction** — `/api/extract-order`
- **Media processing** — `/api/media-process`

Focus: messy customer input → structured order → courier-ready output.
