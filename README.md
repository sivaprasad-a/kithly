# Kithly — intimate invitations for your closest circle

**v0.1.0**

> **Working name.** Change `NEXT_PUBLIC_APP_NAME` in `.env.local` and every screen updates.

Hosts design an elegant invite, send personal links over WhatsApp, email or Instagram, and see who's coming, what they'll eat and what they'll drink. Guests never need an account.

## Quick start (5 minutes, no accounts needed)

Requires **Node.js 20.9+** (22 LTS recommended).

```bash
npm install
cp .env.example .env.local        # Windows PowerShell: copy .env.example .env.local
```

Open `.env.local` and set `BETTER_AUTH_SECRET` to any random 32+ characters (or run `npx @better-auth/cli secret`). Then:

```bash
npm run dev
```

Visit http://localhost:3000 → **Sign in → Create account** → **Create an invite**.

With no `MONGODB_URI`, data lives in memory and resets when the dev server restarts. That's fine for clicking around. Add a database below when you want it to stick.

### Test accounts (local dev only)

Two accounts you can sign in with right away on a freshly started `npm run dev` — created against the in-memory store, so they only exist for the life of that dev server process:

| Name | Email | Password |
|---|---|---|
| Priya Rao | `host@example.com` | `testpass123` |
| Rahul Mehta | `demo@example.com` | `testpass123` |

> These **won't work on the deployed Dev/QA/Prod environments**: none of them have a real database configured yet, so Vercel's serverless instances don't share the in-memory store between requests — a signed-up account can disappear before you get to sign in with it. Tracked in [#3](https://github.com/sivaprasad-a/kithly/issues/3). Once `MONGODB_URI` is set per environment, create real accounts there the normal way (**Sign in → Create account**).

## Add a database (free)

**Option A: MongoDB Atlas M0 (free forever, recommended for the dev environment)**
1. Create a free cluster at https://www.mongodb.com/cloud/atlas
2. *Database Access* → add a user. *Network Access* → allow your IP.
3. *Connect → Drivers* → copy the `mongodb+srv://…` string into `MONGODB_URI`.

**Option B: Local Docker**
```bash
npm run db:up                      # starts mongo:8 on localhost:27017
```
Then set `MONGODB_URI=mongodb://localhost:27017`.

Collections and indexes are created automatically on first use.

## Optional extras

| Feature | Free? | Setup |
|---|---|---|
| Google sign-in | ✅ | Create OAuth credentials in Google Cloud Console. Redirect URI: `http://localhost:3000/api/auth/callback/google` |
| Facebook sign-in | ✅ | Create an app at developers.facebook.com. Redirect URI: `http://localhost:3000/api/auth/callback/facebook` |
| AI co-host (Gemini) | ✅ free tier | Get a key at https://aistudio.google.com/apikey → `GOOGLE_GENERATIVE_AI_API_KEY` |
| AI co-host (Claude) | 💲 pay-as-you-go | `ANTHROPIC_API_KEY` |

Without an AI key, **"Write it with Kiki"** falls back to built-in templates, so the button always works.

## Environments

| | Branch | Link |
|---|---|---|
| Dev | `dev` | https://kithly-dev.vercel.app |
| QA | `qa` | https://kithly-qa.vercel.app |
| Prod | `main` | https://kithly-eight.vercel.app |

Features go **feature branch → PR into `dev` → approve Dev → approve QA → approve Prod**. Each feature is promoted on its own, and nothing deploys without your approval. Details and setup are in **[docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)**.

## Contributing a feature

```bash
git checkout dev && git pull
git checkout -b feature/short-name
# …code…
npm run lint && npm run typecheck && npm test
git push -u origin feature/short-name      # then open a PR into dev
```

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Dev server on :3000 |
| `npm run build && npm start` | Production build |
| `npm test` | Unit tests (Vitest) |
| `npm run test:e2e` | End-to-end tests (Playwright) on an isolated in-memory server, port 3100. First time: `npx playwright install chromium` |
| `npm run typecheck` / `npm run lint` | TypeScript / ESLint |
| `npm run db:up` / `db:down` | Local MongoDB via Docker |

## Tech stack

- **Next.js 16** (App Router, Server Actions, Cache Components) + **TypeScript**
- **Tailwind CSS v4**, palette in `src/app/globals.css`
- **Better Auth**: email/password + Google + Facebook, stored in MongoDB
- **MongoDB** native driver (Atlas M0 or Docker), with an in-memory fallback
- **Zustand** for editor state, **Zod** for validation, **React Hook Form** for the RSVP form
- **Motion** for animations. Three.js is planned for one "envelope opening" moment in a later phase.
- **Vercel AI SDK** with Gemini (free) or Claude
- **Vitest** + **Playwright**

## How it fits together

```
src/
  app/
    page.tsx                     Landing
    sign-in/                     Host sign-in / sign-up
    dashboard/                   Host's events
    events/[id]/edit/            Editor (20% panel / 80% live preview)
    events/[id]/responses/       RSVP dashboard
    i/[token]/                   Guest invite + RSVP (no login)
    api/auth/[...all]/           Better Auth
    api/ai/suggest/              AI co-host (hosts only)
  components/
    invite/InviteCard.tsx        The invitation (shared by editor, guest page, landing)
    editor/                      Editor panel, AI writer, guest list
    rsvp/RsvpForm.tsx            Guest form
    responses/                   Host dashboard
    share/ShareDialog.tsx        WhatsApp / email / Instagram / native share
  lib/
    actions.ts                   Server Actions (all writes; ownership checked)
    db/repo.ts                   Data access: MongoDB or in-memory
    schemas.ts                   Zod schemas + types
    tally.ts                     RSVP maths (unit-tested)
    share.ts, format.ts, ai.ts
```

**Guest links.** Each invited family gets a private link (`/i/<token>`), so you know who's replying with no sign-up. Each event also has an open link for anyone not on the list. They type their family name, and they're added to your list automatically.

**Sharing.** WhatsApp and email use share links that open the host's own app. Instagram doesn't let apps send DMs, so the message is copied for pasting. On phones, **More…** opens the system share sheet, which includes Instagram if it's installed.

## Roadmap

- **Phase 2:** move photos to Cloudinary (free tier), offline support with Serwist, push notification when a guest replies, automatic reminder emails with Resend (free tier)
- **Phase 3:** AI features: palette from the hero photo, AI background art, guest Q&A ("Is there parking?"), gift ideas from the favourites
- **Phase 4:** automated WhatsApp through the Business Cloud API (needs Meta business verification and approved message templates; billed per message), Three.js envelope animation, deploy to Vercel
