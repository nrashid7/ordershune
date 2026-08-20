# OrderShune Full-Product Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign OrderShune's marketing, authentication, and operational dashboard surfaces into one responsive, trustworthy commerce-operations experience for Bangladeshi sellers without changing business behavior.

**Architecture:** Establish a shared visual system in the existing Tailwind/shadcn layer, then apply it through the three route-group layouts. Keep data fetching and server actions unchanged. Extract dashboard navigation data into a testable module so desktop and mobile navigation can intentionally use different information densities.

**Tech Stack:** Next.js 16.2 App Router, React 19, Tailwind CSS 4, shadcn/Radix UI, Lucide icons, Vitest.

## Global Constraints

- Read relevant guidance in `node_modules/next/dist/docs/` before changing Next.js code.
- Preserve every existing route, action, and database query.
- Use semantic color tokens; do not hardcode visual colors inside reusable components.
- Maintain 44px minimum touch targets, visible focus states, keyboard navigation, and reduced-motion support.
- Use Lucide SVG icons only; no emoji structural icons.
- Keep mobile primary navigation to five destinations and expose secondary destinations through a menu.
- Do not add runtime dependencies.

---

### Task 1: Shared brand and visual foundation

**Files:**
- Modify: `app/globals.css`
- Modify: `app/layout.tsx`
- Modify: `components/ui/button.tsx`
- Modify: `components/ui/card.tsx`

**Interfaces:**
- Consumes: existing Tailwind theme tokens and shadcn component APIs.
- Produces: semantic brand/surface tokens, a display-font variable, and consistent button/card elevation and focus treatment used by every route group.

- [ ] **Step 1: Inspect existing primitives and confirm their public variants remain unchanged.**
- [ ] **Step 2: Replace neutral grayscale tokens with a warm stone surface system, deep ink foregrounds, and a saturated emerald brand scale in both themes.**
- [ ] **Step 3: Load a variable display font with `next/font/google` while retaining Geist for body text.**
- [ ] **Step 4: Refine buttons and cards without changing exported APIs.**
- [ ] **Step 5: Run `npm run typecheck` and confirm exit code 0.**

### Task 2: Marketing and authentication redesign

**Files:**
- Modify: `app/(marketing)/layout.tsx`
- Modify: `app/(marketing)/page.tsx`
- Modify: `components/marketing/site-header.tsx`
- Modify: `components/marketing/site-footer.tsx`
- Modify: `app/(auth)/layout.tsx`
- Modify: `components/auth/login-form.tsx`
- Modify: `components/auth/signup-form.tsx`

**Interfaces:**
- Consumes: existing `Button`, `Card`, route links, and auth server actions.
- Produces: a conversion-focused public page, responsive marketing header, branded auth frame, and visually consistent login/signup cards.

- [ ] **Step 1: Build a split hero with product proof, one primary CTA, and a lightweight message-to-order workflow preview.**
- [ ] **Step 2: Add concise trust, workflow, channel, courier, and final-CTA sections using semantic HTML and Lucide icons.**
- [ ] **Step 3: Make the marketing header responsive and keep all interactive targets at least 44px.**
- [ ] **Step 4: Reframe auth pages with a brand story panel on large screens and a compact form-first mobile layout.**
- [ ] **Step 5: Run `npm run typecheck` and confirm exit code 0.**

### Task 3: Dashboard information architecture and shell

**Files:**
- Create: `components/dashboard/navigation.ts`
- Create: `components/dashboard/navigation.test.ts`
- Modify: `components/dashboard/dashboard-shell.tsx`
- Modify: `components/dashboard/nav-link.tsx`
- Modify: `app/(dashboard)/layout.tsx`

**Interfaces:**
- Produces: `desktopNavItems: NavItem[]`, `mobileNavItems: NavItem[]`, and `secondaryNavItems: NavItem[]`.
- Consumes: those arrays in `DashboardShell` to render a desktop sidebar, five-item mobile bar, and secondary mobile menu.

- [ ] **Step 1: Write a failing Vitest test asserting that mobile navigation has exactly five labeled destinations, contains Home/Orders/Inbox/Customers, and excludes settings/alerts/COD from the primary bar.**
- [ ] **Step 2: Run `npm test -- components/dashboard/navigation.test.ts` and confirm it fails because the module does not exist.**
- [ ] **Step 3: Implement the navigation module with explicit primary and secondary arrays.**
- [ ] **Step 4: Re-run the focused test and confirm it passes.**
- [ ] **Step 5: Replace the top-tab desktop shell with a persistent sidebar, compact top utility bar, and accessible mobile bottom navigation plus menu.**
- [ ] **Step 6: Run the focused test and `npm run typecheck`.**

### Task 4: Operational dashboard and order workspace polish

**Files:**
- Modify: `app/(dashboard)/dashboard/page.tsx`
- Modify: `app/(dashboard)/orders/page.tsx`
- Modify: `components/orders/orders-table.tsx`
- Modify: `components/orders/status-badge.tsx`
- Modify: `components/empty-state.tsx`

**Interfaces:**
- Consumes: existing Supabase results and unchanged order action contracts.
- Produces: hierarchy-rich KPI cards, actionable operations overview, responsive order list/table behavior, and consistent empty/status states.

- [ ] **Step 1: Redesign the dashboard header and KPI cards around today's work, exceptions, and courier readiness.**
- [ ] **Step 2: Improve courier status and recent-order scanning with icons, compact metadata, and clear action hierarchy.**
- [ ] **Step 3: Redesign orders filtering and bulk actions; keep the table for desktop and provide readable overflow behavior on narrow screens.**
- [ ] **Step 4: Normalize status colors and empty states against the semantic token system.**
- [ ] **Step 5: Run `npm test`, `npm run lint`, `npm run typecheck`, and `npm run build`; require exit code 0 for each.**

### Task 5: Responsive visual verification

**Files:**
- Modify only files from Tasks 1–4 when a verified issue is found.

**Interfaces:**
- Consumes: production build served locally.
- Produces: verified layouts at 375px, 768px, and desktop widths with keyboard and reduced-motion checks.

- [ ] **Step 1: Start the production server from the successful build.**
- [ ] **Step 2: Inspect `/`, `/login`, and authenticated-shell rendering at mobile and desktop sizes where local data permits.**
- [ ] **Step 3: Check for horizontal overflow, obscured content, missing focus indicators, and undersized touch targets.**
- [ ] **Step 4: Fix any observed issue and rerun the relevant focused verification.**
- [ ] **Step 5: Review `git diff --check` and `git status --short` before handoff.**
