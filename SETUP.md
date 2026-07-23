# 🚗 WashMaster Pro — Developer Onboarding

## Prerequisites

| Tool | Version | Purpose |
|---|---|---|
| **Node.js** | ≥ 20 | Runtime |
| **pnpm** | ≥ 10 | Package manager (workspace) |
| **PostgreSQL** | ≥ 15 | Database |
| **Git** | — | Version control |

---

## Quick Start

```bash
# 1. Clone the repository
git clone <repo-url>
cd car-wash

# 2. Install dependencies
pnpm install

# 3. Set up environment variables
cp .env.example .env.local   # (or create from scratch — see below)

# 4. Run database migrations
npx drizzle-kit migrate

# 5. (Optional) Seed demo data
pnpm db:seed

# 6. Start development server
pnpm dev
```

Open **http://localhost:3000** in your browser.

---

## Environment Variables

Create `.env.local` in the project root with the following:

### Required (core)

```bash
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/washmaster

# Auth (generate with: openssl rand -hex 32)
BETTER_AUTH_SECRET=your-random-secret-here
```

### Required for auth features

```bash
# Google OAuth (https://console.cloud.google.com/apis/credentials)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

### Optional — only if using Supabase features

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### Optional — email sending (SMTP or Resend)

```bash
# Option A: Resend (easier — https://resend.com)
RESEND_API_KEY=re_your-api-key
EMAIL_FROM=onboarding@resend.dev
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Option B: SMTP (configured via admin panel)
# No env vars needed — SMTP is managed in the superadmin UI
```

### Optional — image uploads (Cloudinary)

```bash
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

> If Cloudinary is not configured, logo uploads fall back to local filesystem (`public/uploads/logo/`).

---

## Database Setup

### Option A: Local PostgreSQL

```bash
# Create the database
createdb washmaster

# Run migrations
npx drizzle-kit migrate

# Seed demo data (creates admin user + sample services)
pnpm db:seed
```

The seed creates:
- **Admin user**: `admin@washmaster.com` / `WashMaster2026!`
- **Sucursal Principal**: default branch
- **Sample services**: 6 demo services across 4 categories

### Option B: Remote / Supabase

1. Get your connection string from Supabase → Project Settings → Database
2. Set `DATABASE_URL` to the connection string (use `?sslmode=require` suffix)
3. Run `npx drizzle-kit migrate`

---

## Project Map

```
src/
├── app/                     # Next.js App Router pages
│   ├── (auth)/              # Login, registration
│   ├── (dashboard)/         # Main app (caja, clientes, ordenes, etc.)
│   └── (superadmin)/        # Multi-tenant admin panel
├── components/
│   ├── layout/              # Sidebar, header, auth gate
│   ├── ui/                  # shadcn/ui primitives
│   └── shared/              # Theme provider, pagination, etc.
├── lib/
│   ├── actions/             # Server actions (business logic)
│   ├── auth/                # Better Auth config + permissions
│   ├── db/                  # Schema, migrations, seed
│   └── hooks/               # Shared hooks (d3, lucide, recharts)
├── __tests__/               # Unit tests (Vitest)
└── tests/                   # E2E tests (Playwright)
```

---

## Dev Workflow

### Running checks before committing

```bash
pnpm lint              # ESLint (TypeScript + security rules)
npx tsc --noEmit       # TypeScript type check
pnpm test:run          # Vitest unit tests
```

### Database changes

```bash
# Generate a new migration after schema changes
pnpm dlx drizzle-kit generate

# Apply migrations
npx drizzle-kit migrate
```

### First contribution checklist

- [ ] Read `CONTRIBUTING.md` for server action auth patterns
- [ ] Create a feature branch: `git checkout -b feat/your-feature`
- [ ] Make changes and run `pnpm lint && npx tsc --noEmit`
- [ ] Commit with conventional commit message: `feat: description`
- [ ] Push and open a Pull Request

---

## Key Technologies

| Technology | Purpose |
|---|---|
| **Next.js 16** | App Router, Server Actions, React 19 |
| **Drizzle ORM** | Database queries, migrations |
| **Better Auth** | Auth (email/password, Google OAuth, sessions) |
| **Tailwind CSS 4** | Styling |
| **shadcn/ui** | Component primitives (buttons, dialogs, tables) |
| **d3 + Recharts** | Charts and data visualization |
| **PostgreSQL** | Database (via `postgres` driver) |
| **Vitest** | Unit testing |
| **Playwright** | E2E testing |

---

## Troubleshooting

**`pnpm install` fails**
- Ensure you're using pnpm ≥ 10: `pnpm --version`
- Delete `pnpm-lock.yaml` and `node_modules`, then re-run

**`drizzle-kit migrate` fails with connection error**
- Verify `DATABASE_URL` is correct in `.env.local`
- Ensure PostgreSQL is running and accessible

**App loads but login returns error**
- Run `pnpm db:seed` to create the initial admin user
- Check that migrations were applied

**`pnpm dev` shows blank page**
- Check the terminal for compile errors
- Ensure all environment variables are properly set
