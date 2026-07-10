# Gig Admin — v1

Mobile-first personal admin tool for gigging freelancers (DJ / photo / video / web).
Dark club theme. One data model: a gig flows **Inquiry → Negotiating → Confirmed → Played → To invoice → Pending → Paid**.

## Run it

```bash
npm install
npm run dev      # open the printed localhost URL (best viewed at phone width)
npm run build    # production build in dist/
```

## What's inside (v1)

- **Home** — this month vs target, money you're waiting on, next gig, "played but not invoiced" nudge, .ics calendar export
- **Gigs** — kanban pipeline, drag & drop (or stage selector on mobile), add/edit/delete gigs
- **Money** — the income-target spreadsheet, appified: monthly target + progress + next-month projection, To invoice / Pending / Paid buckets, overdue flags, one-tap reminder email drafts
- **Invoices** — created from played gigs in 2 taps; line items, deposit %, cancellation clause, auto numbering (YYYY-NNN), Draft/Sent/Paid statuses
- **Insights** — year totals + YoY, earnings & bookings per category, month-by-month chart
- **Profile** — your public EPK: bio, embedded player (SoundCloud/YouTube/Spotify link), gear, rates, socials, upcoming gigs auto-pulled from the pipeline

Data persists in your browser (localStorage) with realistic sample data seeded. Clear site data to reset to seeds.

## v2 backend (Supabase)

One-time setup:
1. Supabase dashboard → SQL Editor → paste `supabase/schema.sql` → Run
2. Supabase → Authentication → URL Configuration → Site URL: `https://gig-admin-ivory.vercel.app`, and add `http://localhost:5173` to Redirect URLs
3. Redeploy: `npx vercel --prod`

How it works: the app stays local-first (works without an account). Signing in via magic link (Profile → Edit → Account) syncs all data to Supabase and publishes a permanent public EPK at `/#/u/<your-slug>` that always shows your latest profile + upcoming gigs. First sign-in uploads whatever is on the device, so existing testers keep their data.

## Roadmap
- **v2 (Pro):** festival tracker (deadlines, requirements, status), smart trackable gig links, real calendar sync + email sending
- **v3:** directory of EPK pages + venue-verified badges, payments on invoices (Stripe/PayPal — research what venues actually use), media APIs
