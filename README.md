# SwiftHaul — Modern Logistics Platform

A full-stack logistics platform built on **Cloudflare (Pages + Workers + D1 + KV)** with a cinematic dark glassmorphism UI.

## Architecture

```
swifttrack/
├── frontend/          # React + Vite + TypeScript (Cloudflare Pages)
└── worker/            # Hono.js REST API (Cloudflare Workers + D1 + KV)
```

## Tech Stack

| Layer      | Technology                         |
|------------|-------------------------------------|
| Frontend   | React 18, Vite, TypeScript          |
| Styling    | Tailwind CSS + custom glassmorphism |
| Animation  | Framer Motion                       |
| Charts     | Recharts                            |
| Icons      | Lucide React                        |
| Data       | TanStack React Query                |
| Router     | React Router DOM v6                 |
| Backend    | Hono.js on Cloudflare Workers       |
| Database   | Cloudflare D1 (SQLite at the edge)  |
| Cache      | Cloudflare KV                       |
| Auth       | JWT (signed at the edge)            |

---

## Quick Start

### Frontend

```bash
cd frontend
npm install
cp .env.example .env.local
# edit .env.local and set VITE_API_BASE
npm run dev          # http://localhost:5173
npm run build        # production build to dist/
```

### Worker (Backend)

```bash
cd worker
npm install

# 1. Create D1 database
wrangler d1 create swifthaul-db

# 2. Create KV namespace
wrangler kv:namespace create CACHE

# 3. Update wrangler.toml with the IDs above

# 4. Set JWT secret
wrangler secret put JWT_SECRET

# 5. Run migrations
wrangler d1 execute swifthaul-db --file=./schema.sql

# 6. Dev
wrangler dev          # http://localhost:8787

# 7. Deploy
wrangler deploy
```

---

## API Endpoints

| Method | Path                  | Auth     | Description               |
|--------|-----------------------|----------|---------------------------|
| GET    | `/api/track/:id`      | Public   | Get parcel + tracking      |
| POST   | `/api/auth/login`     | Public   | Admin login → JWT          |
| GET    | `/api/parcels`        | JWT      | List parcels (paginated)   |
| POST   | `/api/parcels`        | JWT      | Create parcel              |
| PUT    | `/api/parcels/:id`    | JWT      | Update parcel              |
| DELETE | `/api/parcels/:id`    | JWT      | Delete parcel              |
| POST   | `/api/events/:id`     | JWT      | Add tracking event         |
| GET    | `/api/analytics`      | JWT      | Dashboard analytics        |
| GET    | `/api/health`         | Public   | Health check               |

---

## Admin Access

Demo credentials (after running `schema.sql` seed):

- **Email:** `admin@swifthaul.dev`
- **Password:** `admin123`

Demo tracking IDs: `SH-2024-DEMO01`, `SH-2024-DEMO02`, `SH-2024-DEMO03`

---

## Deployment

### Frontend → Cloudflare Pages

```bash
# In the Cloudflare dashboard, connect your GitHub repo and set:
# Build command: npm run build
# Build output: dist
# Root directory: frontend
# Environment variable: VITE_API_BASE = https://your-worker.workers.dev/api
```

### Worker → Cloudflare Workers

```bash
cd worker
wrangler deploy
```
