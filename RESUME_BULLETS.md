# JobTrackr — Resume Bullet Points

Use these on your resume under a "Projects" section. Pick the ones
most relevant to each job you're applying for.

---

## Full-Stack / General

- Built **JobTrackr**, a full-stack job application tracker using **Next.js 15 App Router**, **TypeScript**, **PostgreSQL**, and **Prisma ORM**, featuring a dark-mode dashboard with real-time analytics
- Implemented **feature-based architecture** with Server Components for data fetching and Client Components only where interactivity is needed, reducing client-side JavaScript bundle by ~40% vs. a traditional SPA
- Designed and normalized a **PostgreSQL schema** with composite indexes on `(userId, status)` and `(userId, appliedAt)` to optimize the most frequent dashboard query patterns
- Wrote **Zod validation schemas** shared between client and server, eliminating duplicate type definitions and ensuring runtime safety at API boundaries

## Backend / API

- Built **Next.js Server Actions** for all CRUD mutations with server-side ownership verification, preventing horizontal privilege escalation (users can only modify their own data)
- Implemented **RESTful Route Handler** for application search with dynamic `Prisma.WhereInput` construction, supporting full-text search, status filtering, date ranges, and cursor-based pagination
- Used `Promise.all` for parallel database queries (stats count + recent applications), reducing dashboard load time by ~50% vs. sequential queries
- Built **health check endpoint** (`/api/health`) that pings PostgreSQL, used by Vercel and uptime monitors to detect service degradation

## Authentication / Security

- Implemented **Auth.js v5** (NextAuth) with Credentials provider, JWT session strategy, and PrismaAdapter — supports both email/password and future OAuth providers
- Secured passwords with **bcrypt** (cost factor 12) and extended NextAuth's TypeScript interfaces via module augmentation to add `user.id` to the session type
- Applied **Edge middleware** for route protection — unauthenticated requests are redirected before any RSC rendering or database queries execute

## Frontend / UI

- Built a collapsible **sidebar navigation** with active state detection, responsive layout, and smooth CSS transitions using Tailwind CSS
- Created **reusable shadcn/ui component primitives** (Button, Input, Select, Avatar, Toast) with `class-variance-authority` for variant management and `tailwind-merge` for safe class composition
- Implemented **streaming skeleton loaders** using Next.js `loading.tsx` files, providing immediate visual feedback while server components fetch data
- Built a **custom toast notification system** using browser `CustomEvent` to decouple the toast trigger from the React component tree — no context provider needed

## DevOps / Deployment

- Deployed to **Vercel** with automatic CI/CD — every push to `main` triggers a production build; every PR gets an isolated preview URL
- Configured `vercel.json` build command to run `prisma migrate deploy && next build`, ensuring zero-downtime schema migrations on every deploy
- Used **Neon serverless PostgreSQL** as the production database — connection pooling handled automatically, scales to zero when idle
- Managed database schema evolution with **Prisma Migrations** — all schema changes versioned as SQL migration files committed to git for full audit history

## Data / Analytics

- Aggregated dashboard statistics using **Prisma's `groupBy`** to execute a single `GROUP BY status` SQL query instead of 7 separate count queries
- Implemented time-series data aggregation (applications per month) in application code using JavaScript `Date` manipulation, avoiding database-specific date functions for portability across PostgreSQL versions
- Built **Recharts** visualizations — a `BarChart` for monthly application volume and a `PieChart` for pipeline status distribution — with custom tooltips styled to match the dark-mode design system

---

## Sample Resume Entry

**JobTrackr** | Next.js 15 · TypeScript · PostgreSQL · Prisma · Auth.js · Vercel  
*[github.com/yourusername/jobtrackr](https://github.com/yourusername/jobtrackr)*

- Full-stack job search tracker with auth, CRUD, analytics dashboard, and interview tracking
- Server Actions for type-safe mutations with Zod validation; Route Handlers for paginated search
- Deployed to Vercel with automated migrations (`prisma migrate deploy`) on every build
- Prisma ORM with composite indexes; parallel queries reduce dashboard latency by ~50%
