# 🎯 JobTrackr

A full-stack job application tracking system built with Next.js 15 App Router. Track your entire job search pipeline — from wishlist to offer — with a clean dark-mode dashboard, analytics, and interview scheduling.

## ✨ Features

- **Authentication** — Register/login with NextAuth v5 (JWT sessions, bcrypt passwords)
- **Application Management** — Full CRUD with 7 pipeline statuses (Wishlist → Offer/Rejected)
- **Analytics Dashboard** — Applications per month chart, status distribution, key metrics
- **Interview Tracking** — Schedule, type, location, and outcome per application
- **Search & Filter** — Search by company/role, filter by status, sort by date
- **Dark Mode** — Designed dark-first with a professional blue/slate palette
- **Mobile Responsive** — Works on all screen sizes

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS + shadcn/ui |
| Auth | NextAuth v5 / Auth.js |
| Database | PostgreSQL |
| ORM | Prisma 5 |
| Charts | Recharts |
| Validation | Zod |
| Forms | React Hook Form |
| Hosting | Vercel + Neon (recommended) |

---

## 🚀 Local Development

### Prerequisites

- **Node.js 20+** — [nodejs.org](https://nodejs.org)
- **PostgreSQL** — one of:
  - Install locally: [postgresql.org/download](https://www.postgresql.org/download/)
  - Use [Neon](https://neon.tech) free tier (cloud, no local install needed)
  - Use [Supabase](https://supabase.com) free tier

### Step 1 — Clone and install

```bash
git clone https://github.com/yourusername/jobtrackr.git
cd jobtrackr
npm install
```

### Step 2 — Configure environment

```bash
cp .env.example .env.local
```

Open `.env.local` and fill in:

```env
# Your PostgreSQL connection string
DATABASE_URL="postgresql://postgres:yourpassword@localhost:5432/jobtrackr"

# Random secret — generate with:
# node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
AUTH_SECRET="paste-your-generated-secret-here"

NEXTAUTH_URL="http://localhost:3000"
```

### Step 3 — Set up the database

```bash
# Create tables (runs the SQL migration)
npm run db:migrate

# Optional: load demo data
npm run db:seed
```

### Step 4 — Start the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

**Demo login** (after seeding): `demo@jobtrackr.dev` / `Demo1234!`

---

## ☁️ Deploy to Vercel

### Recommended database: Neon (free, PostgreSQL, Vercel-native)

1. Create a free account at [neon.tech](https://neon.tech)
2. Create a new project — copy the **Connection string** (starts with `postgresql://`)

### Deploy steps

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy (follow the prompts)
vercel
```

Or connect your GitHub repo at [vercel.com/new](https://vercel.com/new) for automatic deploys on every push.

### Set environment variables in Vercel

Go to your project → **Settings → Environment Variables** and add:

| Variable | Value |
|----------|-------|
| `DATABASE_URL` | Your Neon/Supabase connection string |
| `AUTH_SECRET` | 32+ random characters |
| `NEXTAUTH_URL` | `https://your-app.vercel.app` |

### Run migrations on the production database

```bash
# Point at production DB and migrate
DATABASE_URL="your-neon-connection-string" npx prisma migrate deploy
```

Or add this as a **build command** in Vercel:
```
prisma migrate deploy && next build
```

---

## 📁 Project Structure

```
jobtrackr/
├── src/
│   ├── app/                          # Next.js App Router pages
│   │   ├── auth/
│   │   │   ├── login/page.tsx
│   │   │   └── register/page.tsx
│   │   ├── dashboard/
│   │   │   ├── layout.tsx            # Sidebar + TopBar layout
│   │   │   ├── page.tsx              # Server Component — fetches stats
│   │   │   └── loading.tsx           # Skeleton while loading
│   │   ├── applications/
│   │   │   ├── page.tsx              # Applications list
│   │   │   ├── new/page.tsx          # Create form
│   │   │   └── [id]/page.tsx         # Detail view
│   │   ├── interviews/page.tsx
│   │   └── api/
│   │       ├── auth/[...nextauth]/   # NextAuth handler
│   │       ├── applications/         # Search + paginate
│   │       └── health/               # Health check
│   ├── components/
│   │   ├── ui/                       # Button, Input, Select, etc.
│   │   ├── layout/                   # Sidebar, TopBar
│   │   ├── auth/                     # LoginForm, RegisterForm
│   │   ├── dashboard/                # Stats, Charts, RecentApps
│   │   ├── applications/             # Form, Table, Filters, Detail
│   │   └── interviews/               # InterviewsList
│   ├── lib/
│   │   ├── auth/auth.ts              # NextAuth config
│   │   ├── db/prisma.ts              # Prisma singleton
│   │   ├── actions/                  # Server Actions (mutations)
│   │   ├── validations/schemas.ts    # Zod schemas
│   │   └── utils/cn.ts
│   └── types/
│       ├── index.ts
│       └── next-auth.d.ts
├── prisma/
│   ├── schema.prisma                 # Database models
│   ├── seed.ts                       # Demo data
│   └── migrations/                   # SQL migration history
├── middleware.ts                     # Route protection
├── .env.example                      # Environment variable template
└── README.md
```

---

## 🗄️ Database Schema

```
User ──< JobApplication ──< Interview
                       ──< Note
User ──< Account  (NextAuth OAuth)
User ──< Session  (NextAuth)
```

**Indexes for performance:**
- `(userId, status)` — dashboard status counts
- `(userId, appliedAt)` — timeline sorting
- `companyName` — search

---

## 🧪 Dev Commands

```bash
npm run dev              # Start dev server at localhost:3000
npm run build            # Production build
npm run type-check       # TypeScript check (no emit)
npm run lint             # ESLint

npm run db:migrate       # Apply new migration (dev)
npm run db:seed          # Load demo data
npm run db:studio        # Open Prisma Studio (DB GUI)
npm run db:generate      # Regenerate Prisma client after schema change
```

---

## 🔒 Security

- Passwords hashed with **bcrypt** (cost factor 12)
- Every mutation checks **row-level ownership** (`userId`) server-side
- **Zod validation** on both client (UX) and server (security)
- **Edge middleware** redirects unauthenticated users before any DB query
- All secrets in environment variables — never hardcoded

---

## 📄 License

MIT
