# JobTrackr — Implementation Plan & Architecture Guide

This document walks you through building JobTrackr from scratch, step by step.
Read each section fully before starting it — understanding the *why* before the
*how* is what separates senior engineers from juniors.

---

## Phase 0: Project Scaffolding (Day 1)

### 0.1 Bootstrap Next.js

```bash
npx create-next-app@latest jobtrackr \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --src-dir \
  --import-alias "@/*"
```

**Why `--app`?** The App Router (introduced in Next.js 13) enables React Server
Components. RSCs run on the server and send zero JavaScript to the client,
which is a paradigm shift from the Pages Router. Most new Next.js projects
should use App Router.

### 0.2 Install Dependencies

```bash
npm install next-auth@beta @auth/prisma-adapter prisma @prisma/client
npm install zod react-hook-form @hookform/resolvers
npm install recharts date-fns lucide-react
npm install bcryptjs class-variance-authority clsx tailwind-merge tailwindcss-animate
npm install @radix-ui/react-select @radix-ui/react-label @radix-ui/react-slot
npm install @radix-ui/react-avatar @radix-ui/react-dialog @radix-ui/react-toast
npm install -D @types/bcryptjs tsx
```

### 0.3 Initialize Prisma

```bash
npx prisma init
```

This creates `prisma/schema.prisma` and adds `DATABASE_URL` to `.env`.

---

## Phase 1: Database & Schema (Day 1–2)

### 1.1 Design the Schema

Before writing a single line of application code, get the schema right.
Changing schemas mid-project means rewriting migrations and possibly
losing data. Questions to ask:

- What are the core entities? (User, JobApplication, Interview, Note)
- What are the relationships? (User 1→∞ Application, Application 1→∞ Interview)
- What queries will be common? (Filter by status, sort by date)
- What indexes do those queries need?

### 1.2 Write `schema.prisma`

Key decisions documented in the schema comments:
- **Enums for status** — database enforces valid states
- **Composite indexes** on `(userId, status)` and `(userId, appliedAt)`
- **Cascade deletes** — deleting a user removes all their data

### 1.3 Create and Apply Migration

```bash
# Create the migration (generates SQL + updates schema)
npx prisma migrate dev --name init

# Open Prisma Studio to verify the schema
npx prisma studio
```

**Never** run `prisma db push` in production — it skips the migration history.
Always use `prisma migrate deploy` in production environments.

---

## Phase 2: Authentication (Day 2–3)

### 2.1 Why Auth.js v5?

Auth.js v5 (NextAuth beta) has a single `auth()` function that works in:
- Middleware (for route protection)
- Server Components (for reading the session)
- Server Actions (for protecting mutations)
- Route Handlers (for API auth)

This eliminates four separate auth mechanisms — one function does it all.

### 2.2 Implementation Order

1. Create `src/lib/auth/auth.ts` — configure providers and callbacks
2. Create `src/app/api/auth/[...nextauth]/route.ts` — wire up the HTTP handler
3. Create `middleware.ts` — protect routes at the Edge
4. Augment NextAuth types in `src/types/next-auth.d.ts`
5. Build login/register forms as Client Components
6. Build login/register pages as Server Components (wrap forms)
7. Test the full auth flow

### 2.3 JWT vs Database Sessions

**JWT (chosen):** The user ID is encoded in a signed token stored in a cookie.
No database lookup per request. Scales well. Tokens can't be invalidated
server-side until they expire.

**Database sessions:** Every request queries the DB for session validity.
Can be invalidated instantly. Required for security-sensitive apps (banking).

For a job tracker, JWT is the right tradeoff.

---

## Phase 3: Core CRUD (Day 3–5)

### 3.1 Server Actions vs Route Handlers

| Use case | Choose |
|----------|--------|
| Form submissions (create, update, delete) | Server Action |
| Revalidation after mutation | Server Action (`revalidatePath`) |
| Complex GET with many query params | Route Handler |
| File uploads | Route Handler |
| Webhooks | Route Handler |

### 3.2 Validation Strategy

**Always validate on the server, even if you validated on the client.**

Client-side validation is a UX enhancement — it gives fast feedback.
Server-side validation is a security requirement — it prevents malicious
requests that bypass the browser entirely.

Zod makes this easy because the same schema validates both:

```typescript
// Client: validate on form submit for fast feedback
const result = schema.safeParse(formData);

// Server: validate in the action before touching the DB
const result = schema.safeParse(input);
```

### 3.3 Authorization Checks

Never trust the client to send only IDs that belong to them.

```typescript
// WRONG ❌ — anyone can delete any application by ID
await prisma.jobApplication.delete({ where: { id } });

// CORRECT ✓ — verify ownership before deleting
const existing = await prisma.jobApplication.findFirst({
  where: { id, userId }  // userId from server-side session
});
if (!existing) return { error: "Not found" };
await prisma.jobApplication.delete({ where: { id } });
```

---

## Phase 4: Dashboard & Analytics (Day 5–6)

### 4.1 Server Components for Data Fetching

The dashboard page is a React Server Component. It fetches data directly
(no useEffect, no loading states for initial render) and passes it to
Client Components for interactivity.

```
DashboardPage (RSC) → fetches stats → passes to:
  ├── StatsCards (RSC — pure display, no JS sent)
  ├── ApplicationsByMonthChart (Client — Recharts needs browser APIs)
  ├── StatusDistributionChart (Client — Recharts needs browser APIs)
  └── RecentApplications (RSC — pure display, no JS sent)
```

### 4.2 Parallel Queries

Don't chain `await` calls that don't depend on each other:

```typescript
// SLOW ❌ — sequential, ~200ms total
const stats = await getStats();
const recent = await getRecentApps();

// FAST ✓ — parallel, ~100ms total
const [stats, recent] = await Promise.all([getStats(), getRecentApps()]);
```

### 4.3 Aggregation with groupBy

Instead of 7 count queries (one per status), use a single `groupBy`:

```typescript
const statusCounts = await prisma.jobApplication.groupBy({
  by: ["status"],
  where: { userId },
  _count: true,
});
// Result: [{ status: "APPLIED", _count: 5 }, { status: "OFFER", _count: 1 }, ...]
```

This is a single `GROUP BY` SQL query regardless of how many statuses exist.

---

## Phase 5: Search & Filtering (Day 6–7)

### 5.1 URL State for Filters

Store filter state in URL query params, not React state. This means:
- Shareable URLs (users can bookmark filtered views)
- Browser back/forward works correctly
- No hydration mismatches between server and client

```typescript
// Use Next.js useSearchParams + router.push to update URL
const router = useRouter();
router.push(`/applications?status=APPLIED&sortBy=appliedAt`);
```

### 5.2 Dynamic Prisma Where Clauses

Build the `where` object dynamically:

```typescript
const where: Prisma.JobApplicationWhereInput = {
  userId: session.user.id,
  ...(search && {
    OR: [
      { companyName: { contains: search, mode: "insensitive" } },
      { jobTitle: { contains: search, mode: "insensitive" } },
    ],
  }),
  ...(status && { status }),
};
```

The spread operator `...` includes the condition only if the value exists,
so `where` never has `undefined` values that could confuse Prisma.

---

## Phase 6: Deployment to Vercel (Day 7–8)

### 6.1 Database for Production

Use a managed PostgreSQL service — no server to maintain:

- **[Neon](https://neon.tech)** — free tier, serverless Postgres, integrates directly with Vercel
- **[Supabase](https://supabase.com)** — free tier, Postgres + extras (storage, auth if you want)
- **[Railway](https://railway.app)** — simple pricing, great DX

Neon is the most common choice for Vercel projects.

### 6.2 Deploy Steps

```bash
# 1. Push your code to GitHub

# 2. Go to vercel.com/new → import your GitHub repo

# 3. Add environment variables in Vercel dashboard:
#    DATABASE_URL  = your Neon connection string
#    AUTH_SECRET   = 32+ random chars
#    NEXTAUTH_URL  = https://your-app.vercel.app

# 4. Set the build command in Vercel to run migrations:
#    prisma migrate deploy && next build

# 5. Deploy!
```

### 6.3 Automatic Deploys

Once connected to GitHub, every push to `main` triggers a production deploy.
Every PR gets a **preview deployment** at a unique URL — great for testing
changes before merging.

### 6.4 Running Migrations Safely

In production, always use `migrate deploy` (not `migrate dev`).

```bash
# migrate deploy applies pending migrations without creating new ones
# Safe to run on production — it won't reset data
DATABASE_URL="..." npx prisma migrate deploy
```

Add it as a Vercel build command so it runs automatically on every deploy:
```
prisma migrate deploy && next build
```

---

## Checklist Before "Shipping"

- [ ] All mutations have server-side auth checks
- [ ] All inputs validated with Zod on the server
- [ ] Environment variables documented in `.env.example`
- [ ] No secrets committed to git
- [ ] `AUTH_SECRET` is at least 32 random characters
- [ ] `npm run build` completes with no errors
- [ ] Database migrations are committed
- [ ] `npm run type-check` passes with zero errors
- [ ] `npm run lint` passes with zero warnings
- [ ] README explains setup in under 5 minutes
- [ ] Health check endpoint works

---

## Common Mistakes to Avoid

1. **Calling `prisma.find*` without a userId filter** — any user could access any record
2. **Using `process.env` in Client Components** — only `NEXT_PUBLIC_*` vars are safe
3. **Not using `revalidatePath` after mutations** — cached pages show stale data
4. **Creating a new PrismaClient in every request** — exhausts the DB connection pool
5. **Storing sensitive data in JWT** — JWTs are base64-encoded, not encrypted
6. **Skipping server-side validation** because you validated on the client
7. **Running `prisma db push` in production** — use `prisma migrate deploy`
