# Portfolio Web

A full-stack portfolio site with a built-in CMS. Public pages showcase projects with search and filtering; the admin section provides a rich editor for managing content, screenshots, and contact submissions.

## Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS |
| ORM | Prisma 7 + `@prisma/adapter-pg` |
| Database | Railway Postgres |
| File storage | Railway Storage Bucket (proxied via `/api/files/*`) |
| Auth | iron-session + bcrypt |
| Email | Resend |
| Rich text | Tiptap |
| Package manager | Yarn |
| Deployment | Railway |

## Quick start

```bash
# 1. Install dependencies
yarn install

# 2. Configure environment variables
cp .env.example .env
# → fill in each value (see the Environment variables section below)

# 3. Apply the database schema
yarn prisma migrate deploy

# 4. Generate the Prisma client
yarn prisma generate

# 5. Create the admin user
yarn prisma db seed

# 6. Start the dev server
yarn dev
```

The app will be running at [http://localhost:3000](http://localhost:3000).

## Scripts

```bash
yarn dev           # Start development server
yarn build         # Production build
yarn start         # Start production server
yarn lint          # Run ESLint

yarn prisma migrate deploy   # Apply pending migrations
yarn prisma migrate dev      # Create a new migration (dev only)
yarn prisma generate         # Regenerate Prisma client after schema changes
yarn prisma db seed          # Seed the admin user
yarn prisma studio           # Open Prisma Studio (visual DB browser)
```

## Project structure

```
app/
├── (public)/              # Public-facing pages (no auth)
│   ├── page.tsx           # Home — hero + project grid with search
│   ├── projects/[slug]/   # Project detail page
│   └── contact/           # Contact form + Calendly booking
├── admin/                 # CMS (session-protected)
│   ├── login/             # Login page
│   ├── page.tsx           # Dashboard — stats + recent submissions
│   ├── projects/          # Project CRUD table + editor
│   └── contacts/          # Contact submissions table + CSV export
└── api/
    ├── auth/              # login, logout, me
    ├── projects/          # public read endpoints
    ├── contact/           # contact form submission
    ├── admin/             # protected CRUD + upload + export
    ├── files/             # GET /api/files/* — serves uploaded images
    └── health/            # GET /api/health → { status: "ok" }

components/
├── ui/                    # Button, Input, Textarea, Badge, Modal, Spinner
├── admin/                 # ProjectForm, ImageUploader, SubmissionsTable
└── ...                    # NavBar, Footer, ProjectCard, Lightbox, etc.

lib/
├── prisma.ts              # PrismaClient singleton (pg driver adapter)
├── session.ts             # iron-session config + getSession()
├── storage.ts             # S3 upload/delete helpers (Railway Storage Bucket)
├── resend.ts              # Resend email client
├── utils.ts               # slugify, toYouTubeEmbedUrl, cn, formatDate
└── rate-limit.ts          # In-memory IP rate limiter

prisma/
├── schema.prisma          # Database schema
├── seed.ts                # Admin user seed script
└── migrations/            # Applied migration files

prisma.config.ts           # Prisma 7 CLI config (datasource URL, seed command)
middleware.ts              # Route protection for /admin/* and /api/admin/*
```

## Environment variables

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | Yes | Railway Postgres connection URL (injected automatically when Postgres service is linked) |
| `DIRECT_URL` | Yes | Same as `DATABASE_URL` for Railway — used by Prisma CLI for migrations |
| `BUCKET` | Yes | Railway Storage Bucket name (injected automatically when Bucket is linked) |
| `ACCESS_KEY_ID` | Yes | S3 access key ID for the bucket (injected automatically) |
| `SECRET_ACCESS_KEY` | Yes | S3 secret access key for the bucket (injected automatically) |
| `ENDPOINT` | Yes | S3 endpoint — `https://storage.railway.app` (injected automatically) |
| `REGION` | Yes | Bucket region — e.g. `auto` (injected automatically) |
| `SESSION_SECRET` | Yes | Cookie encryption secret — min 32 chars |
| `ADMIN_USERNAME` | Seed only | Username for the admin account |
| `ADMIN_PASSWORD` | Seed only | Password for the admin account |
| `RESEND_API_KEY` | Yes | Resend API key for contact form emails |
| `RESEND_FROM` | Yes | Sender address (must match verified Resend domain) |
| `CONTACT_EMAIL_TO` | Yes | Address that receives contact form notifications |
| `NEXT_PUBLIC_CALENDLY_URL` | No | Calendly embed URL — omit to show email CTA instead |
| `NEXT_PUBLIC_APP_URL` | Yes | Canonical app URL |

Copy `.env.example` to `.env` and fill in each value before running the app.

## Deployment (Railway)

### Services to provision

1. **Web service** — deploys this repository
2. **Postgres** — add from Railway's template; `DATABASE_URL` is injected automatically
3. **Storage Bucket** — add from Railway's template; S3 credentials are injected automatically when the bucket is linked to the web service

### Service configuration

- **Build command:** `yarn prisma migrate deploy && yarn build`
- **Start command:** `yarn start`

### Environment variables

Set all variables in the Railway dashboard. Key Railway-specific notes:

- `DATABASE_URL` and `DIRECT_URL` — copy the connection string from the Postgres service's **Variables** tab
- `BUCKET`, `ACCESS_KEY_ID`, `SECRET_ACCESS_KEY`, `ENDPOINT`, `REGION` — injected automatically when the Bucket service is linked; copy them from the Bucket's **Variables** tab for local dev
- `SESSION_SECRET` ≥ 32 random characters

After the first deploy, seed the admin user:

```bash
railway run yarn prisma db seed
```

Health check: `GET /api/health` returns `{ "status": "ok" }`.
