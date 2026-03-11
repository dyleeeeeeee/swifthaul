## 🚀 SwiftHaul — Modern Logistics Platform Prompt

---

### Project Overview

Build **SwiftHaul**, a full-stack modern logistics platform deployed entirely on **Cloudflare (Pages + Workers + D1/KV)** at zero cost. The platform serves two audiences: end-users tracking shipments and internal admins managing the logistics pipeline. The design language is **deep glassmorphism** — every surface is frosted, layered, and luminous — set against a dramatic dark world of animated aurora gradients, floating particles, and atmospheric depth. Nothing is flat. Nothing is boring.


## Ensure Variable Dynamism (for easy changes and edits)
---

### Tech Stack

**Frontend:** React (Vite) → deployed on **Cloudflare Pages**
**Backend:** **Cloudflare Workers** (REST API using Hono.js)
**Database:** **Cloudflare D1** (SQLite at the edge) for parcel/tracking records
**KV Store:** **Cloudflare KV** for caching tracking lookups and session tokens
**Auth:** Lightweight JWT stored in HttpOnly cookies, validated at the Worker edge
**Styling:** Tailwind CSS + custom CSS (for glassmorphism and backdrop-filter effects)
**Animations:** Framer Motion (React) for all micro-interactions and page transitions
**Icons:** Lucide React
**Charts:** Recharts (admin dashboard analytics)

---

### Visual Identity & Design System

**Aesthetic:** Cinematic dark glassmorphism. Think deep space meets a luxury cargo terminal — moody, tactile, immersive.

**Color Palette (CSS variables):**
```css
--bg-base: #050810;           /* Near-black navy */
--bg-mid: #0a0f1e;            /* Deep space blue */
--aurora-1: #0d47a1;          /* Electric cobalt */
--aurora-2: #1a237e;          /* Indigo depth */
--aurora-3: #00acc1;          /* Cyan pulse */
--aurora-4: #4a148c;          /* Violet shadow */
--glass-bg: rgba(255,255,255,0.04);
--glass-border: rgba(255,255,255,0.10);
--glass-hover: rgba(255,255,255,0.08);
--glass-shine: rgba(255,255,255,0.15);
--accent-primary: #00e5ff;    /* Neon cyan — CTAs, highlights */
--accent-secondary: #7c4dff;  /* Purple — secondary actions */
--accent-warm: #ff6d00;       /* Amber — status alerts */
--text-primary: #f0f4ff;
--text-secondary: rgba(240,244,255,0.55);
--text-muted: rgba(240,244,255,0.28);
```

**Typography:**
- Display/Hero: `Bebas Neue` or `Barlow Condensed` (700) — bold, industrial, commanding
- Body: `DM Sans` (300–500) — clean and contemporary
- Monospace/Tracking IDs: `JetBrains Mono` — data-feel authenticity

**Glass Component Mixin (apply universally):**
```css
.glass {
  background: var(--glass-bg);
  backdrop-filter: blur(24px) saturate(180%);
  -webkit-backdrop-filter: blur(24px) saturate(180%);
  border: 1px solid var(--glass-border);
  border-radius: 20px;
  box-shadow: 
    0 8px 32px rgba(0,0,0,0.4),
    inset 0 1px 0 var(--glass-shine),
    0 0 0 0.5px rgba(255,255,255,0.05);
}
.glass:hover {
  background: var(--glass-hover);
  border-color: rgba(0,229,255,0.25);
  box-shadow: 
    0 16px 48px rgba(0,0,0,0.5),
    inset 0 1px 0 var(--glass-shine),
    0 0 24px rgba(0,229,255,0.08);
  transition: all 0.35s cubic-bezier(0.23, 1, 0.32, 1);
}
```

---

### Global Background System

The entire site sits on a **living, animated background** — never a static color:

1. **Aurora Layer:** Three large radial gradient blobs (`position: fixed`, `z-index: 0`) that slowly drift and pulse using `@keyframes` with 20–40s cycles. Colors pulled from `--aurora-1` through `--aurora-4`. Opacity ~15–25%.
2. **Noise Texture:** SVG-based grain overlay (`position: fixed`, `opacity: 0.035`) for tactile depth.
3. **Particle Field:** 60–80 tiny dots (canvas or CSS `::before` pseudo-elements) at varying opacities that slowly drift upward. Some blink slowly to simulate distant lights.
4. **Grid Lines:** Subtle perspective grid lines in the hero area only — vanishing point centered — made from `rgba(255,255,255,0.03)` borders. Reinforces the "logistics network" metaphor.

---

### Page 1 — Home / Landing Page

#### Hero Section

Full viewport height. Centred layout with staggered entrance animations (Framer Motion, 80ms stagger per element).

- **Pre-headline tag:** Small glass pill badge: `⚡ Real-time global logistics` — slides in from top, 200ms delay
- **Main Headline:** Two lines. Line 1: `"MOVE ANYTHING."` Line 2: `"TRACK EVERYTHING."` — letters animate in individually using `staggerChildren` with a custom `y: 40 → 0, opacity: 0 → 1` motion. Font: Bebas Neue, 96px desktop / 52px mobile. Color: `--text-primary` with the word `"EVERYTHING"` having a neon cyan text gradient (`--accent-primary` → `--aurora-3`).
- **Sub-headline:** 20px DM Sans 300 weight: `"SwiftHaul delivers precision logistics across 180+ countries. Real-time tracking, zero surprises."` — fades in at 600ms.
- **CTA Row:** Two glass buttons side by side:
  - Primary: `Track a Shipment →` — filled with `--accent-primary`, text dark. On hover: scale(1.04), glow ring (`box-shadow: 0 0 0 3px rgba(0,229,255,0.3)`), shimmer sweep animation across the button.
  - Secondary: `Get a Quote` — glass outline only. On hover: border brightens to cyan, background gains subtle fill.
- **Quick Track Bar:** Below CTAs — a wide glass input field with placeholder `"Enter tracking number (e.g. SH-2024-XXXXXXX)"`. Right side: magnifying glass icon button in accent cyan. On focus: the entire bar gets a cyan glow border and the background lightens slightly (micro-interaction). On submit: the bar shakes with a gentle spring animation if invalid, or transitions the user to the tracking page.
- **Live stats row:** 3 glass stat cards in a row at the bottom of the hero: `2.4M+ Parcels Delivered`, `180+ Countries`, `99.7% On-Time Rate`. Each card has an animated count-up on page load (using a number ticker). Hover: card lifts (translateY -4px), border cyan glow.

#### "How It Works" Section

Dark glass section. Three horizontal steps connected by an animated dashed line (SVG path with a `stroke-dashoffset` scroll-triggered draw animation).

Each step is a tall glass card:
- Numbered badge (glass circle, large monospace number)
- Icon (Lucide, 32px, cyan)
- Title (Barlow Condensed, 24px)
- Description (DM Sans, 15px, `--text-secondary`)
- On scroll-into-view: cards animate in from below with `opacity: 0 → 1`, `y: 60 → 0`, staggered 150ms apart.

Steps: **1. Book Online → 2. We Pick Up → 3. Track Live → 4. Delivered**

#### Services Grid

`2×3` glass card grid (or responsive masonry). Cards represent service tiers:
- Express Overnight, Standard Freight, International Air, Ocean Cargo, Cold Chain, Hazmat Certified

Each card:
- Top: large duotone icon in a frosted icon box (glass within glass — double depth)
- Category label (monospace, small, `--accent-primary`)
- Title + short description
- Bottom: `Learn More →` link that underlines with a left-to-right animated underline on hover
- Entrance: cards stagger in on scroll using Intersection Observer + Framer Motion

#### Testimonials Carousel

Full-width glass strip. Auto-scrolling horizontal marquee of testimonial cards (CSS `animation: scroll linear infinite`). Cards pause on hover. Each card: company logo placeholder, quote text, star rating (gold), customer name + role. Cards use the glass style with a slightly warmer tint (`rgba(255,200,100,0.03)`) to differentiate the section visually.

#### Footer

Glass footer panel. Four columns: Logo + tagline, Navigation links, Service links, Contact info. Bottom bar: copyright + social icons. Social icons have a hover spring scale + color fill micro-interaction.

---

### Page 2 — Parcel Tracking Page (`/track`)

#### URL Behavior

Supports deep-link: `/track?id=SH-2024-XXXXXXX` — pre-fills and auto-submits the search on load.

#### Search Bar

Same glass bar as homepage. On submit: loading state shows a pulsing skeleton inside the results area (3 skeleton rows, shimmer animation using `background-position` keyframe trick).

#### Tracking Result Card (main glass panel)

Large glass card, full-width. Contains two zones:

**Left Zone — Shipment Summary:**
- Tracking ID (JetBrains Mono, large, cyan)
- Status badge: glass pill with color-coded left border and dot indicator:
  - `In Transit` → cyan dot, cyan border
  - `Out for Delivery` → amber dot, amber border  
  - `Delivered` → green dot, green border
  - `Exception` → red dot, red border
- The dot pulses with a `@keyframes pulse` scale animation for active statuses
- Origin → Destination: Two location names with an animated arrow between them (arrow slides right on load)
- ETA: countdown timer if in transit (live JS countdown, updates every second)
- Weight, dimensions, service type — monospace data table inside a nested glass box

**Right Zone — Map Placeholder:**
- A stylized SVG world map with the route drawn as an animated dashed arc (SVG `stroke-dashoffset` animation, cyan color)
- Origin and destination pins glow and pulse
- Current location pin is larger and has a radiating ring animation

#### Timeline Stepper (below the main card)

Vertical stepper. Each milestone is a glass row:
- Left: glass circle with icon (checkmark if done, clock if pending, spinner if active)
- Center: event title + location + description
- Right: timestamp (JetBrains Mono, `--text-muted`)
- Active step: left border glows cyan, background slightly brighter, icon spins gently
- Completed steps: icons in green tint
- Connecting line between steps: animated fill from top using a CSS height transition triggered on load

#### Shipment Details Accordion

Below the timeline. Glass accordion rows for: Package Contents, Handling Instructions, Sender Info (partially masked), Receiver Info (partially masked), Insurance Details. Each row expands with a smooth height animation and chevron rotation micro-interaction.

---

### Page 3 — Admin Dashboard (`/admin`)

Protected by JWT. Redirect to `/admin/login` if unauthenticated.

#### Login Page

Centered glass card on the aurora background. SwiftHaul logo, "Admin Portal" label, email + password fields (glass inputs with floating labels that animate upward on focus — the label shrinks and moves to top-left with a smooth cubic-bezier transition). Submit button with loading spinner state. Error state: card border flashes red briefly, error message fades in below.

#### Dashboard Layout

Left sidebar (glass panel, fixed) + main content area.

**Sidebar:**
- Logo at top
- Nav items: Dashboard, Parcels, Create Shipment, Analytics, Settings
- Active item: glass highlight with left cyan border and text brightens. Hover: background lightens with a subtle shimmer.
- Collapse button at bottom: sidebar animates to icon-only mode (width 72px), tooltips appear on hover.
- User avatar + role badge at bottom.

**Top Bar (glass strip):**
- Page title (Barlow Condensed, 28px)
- Search bar (global parcel search, glass)
- Notification bell with a red badge count (bounces gently when new notifications arrive)
- User menu dropdown (glass, appears with a spring scale animation from top-right corner)

#### Dashboard Home Tab

**KPI Cards Row (4 cards):**
Glass cards, each with: icon (glass icon box), metric name, large number (animated count-up on load), percentage delta vs last period (green arrow up or red arrow down). Cards lift on hover.

Metrics: Total Parcels, In Transit, Delivered Today, Exceptions/Alerts.

**Charts Row:**
- Left (60%): Line chart (Recharts) — shipments over last 30 days. Chart area has a glass container. Line is cyan (`--accent-primary`), area fill is a cyan→transparent gradient. Tooltip is a custom glass tooltip component.
- Right (40%): Donut chart — shipments by status. Custom glass legend below.

**Recent Activity Feed:**
Glass panel, scrollable list. Each row: parcel ID (monospace), event description, timestamp, status badge. Rows highlight on hover (background lightens). "View All" link at bottom.

#### Parcels Table Tab

Full glass table. Features:
- Column headers: sortable (click to toggle asc/desc, arrow icon animates direction). Clicking a header sorts the data client-side with a smooth row reorder animation.
- Columns: Tracking ID, Sender, Receiver, Origin, Destination, Status, Created At, Actions
- Row hover: entire row background lifts slightly (glass-hover effect), a subtle left-border cyan highlight appears
- Status badges: colored glass pills (same palette as tracking page)
- Actions column: three icon buttons per row (View, Edit, Delete). Hover each: icon scales up slightly, background circle appears. Delete shows a glass confirmation popover before executing.
- Pagination: glass pagination bar at bottom. Current page button has cyan fill.
- Filters bar above the table: glass filter chips for Status, Date Range, Origin country. Active filters show with cyan border and a clear ✕ button.
- Search: glass input, filters rows in real time with a debounced API call.

#### Create Shipment Tab

A multi-step glass form wizard. Progress bar at top (glass track, cyan fill animates forward). Steps:

**Step 1 — Sender Info:** Name, company, address, phone, email. Glass inputs with floating labels. Country selector (custom glass dropdown with search).

**Step 2 — Receiver Info:** Same fields for recipient.

**Step 3 — Package Details:** Weight (with unit toggle kg/lb — toggles animate like a pill switch), dimensions (L×W×H), contents description, declared value, service type (radio cards — each a glass card, selected state has cyan border and glow).

**Step 4 — Review & Submit:** Summary of all entered data in a glass confirmation card. Edit links next to each section jump back to that step. Submit button generates tracking ID and shows a success modal.

**Success Modal:** Glass overlay panel. Animated checkmark (SVG stroke draw animation, green). Generated tracking ID (large, monospace, copyable with a "Copied!" tooltip micro-interaction on click). Options: Create Another, View Parcel, Share Tracking Link.

#### Update Tracking Tab

Search for an existing parcel by ID. Result shows current status. Below: glass form to add a new tracking event:
- Event type selector (glass dropdown): Picked Up, In Transit, Arrived at Hub, Out for Delivery, Delivered, Exception
- Location (text input)
- Description (textarea, glass)
- Timestamp (datetime picker, glass styled)
- Submit button — on success, the timeline above updates instantly (optimistic UI update with Framer Motion list animation for the new row).

#### Analytics Tab

Glass panel grid:
- Top countries by shipment volume (horizontal bar chart, Recharts, glass container)
- Average delivery time trend (line chart)
- Exception rate over time (area chart, amber color)
- Revenue by service type (stacked bar or donut)

All charts use the same glass container pattern and custom tooltips.

---

### Micro-Interactions Specification (Exhaustive)

Every interaction should feel alive and intentional:

- **Button press:** `scale(0.96)` on `mousedown`, spring back on `mouseup`. Duration: 120ms.
- **Glass card hover:** `translateY(-4px)` + border color shift to cyan + box-shadow deepens. Duration: 300ms cubic-bezier(0.23, 1, 0.32, 1).
- **Input focus:** Label floats up + shrinks (transform + font-size transition). Border glows cyan. Background shifts from `--glass-bg` to `--glass-hover`. Duration: 250ms.
- **Input error shake:** `translateX` keyframe: 0 → -8px → 8px → -6px → 6px → 0. Duration: 400ms.
- **Dropdown open:** Scales from `scaleY(0.8)` + `opacity: 0` to full, origin top. Spring easing.
- **Status badge dot:** Continuous `scale(1) → scale(1.5) → scale(1)` pulse, 2s loop, for active statuses only.
- **Tracking timeline:** Each milestone row enters with `x: -20 → 0`, `opacity: 0 → 1`, staggered 100ms.
- **Count-up numbers:** Animate from 0 to final value over 1.5s using easeOut curve on page/section enter.
- **Table row delete:** Row shrinks height to 0 + `opacity: 0` with `overflow: hidden` transition before being removed from DOM.
- **Sidebar collapse:** Width animates from 240px → 72px, labels fade out, icons center. Duration 350ms.
- **Copy tracking ID:** Text briefly flashes cyan, a "✓ Copied" tooltip scales in from above then fades out after 1.5s.
- **Form step transition:** Current step slides left + fades out, next step slides in from right. Duration: 400ms.
- **Notification bell:** On new notification badge appearance, bell icon does a `rotate(-15deg) → rotate(15deg) → 0` swing animation.
- **Page transitions:** Route changes use Framer Motion `AnimatePresence` — outgoing page fades and slides up slightly, incoming page fades and slides up from below.
- **Loading skeletons:** Use a `background-position` shimmer animation moving from left to right over a gradient of `rgba(255,255,255,0.04) → rgba(255,255,255,0.10) → rgba(255,255,255,0.04)`.
- **Chart data load:** Recharts `animationDuration={1200}` with `animationEasing="ease-out"` for all charts. Lines draw from left to right.
- **Scroll reveal:** Framer Motion `whileInView` with `viewport={{ once: true, margin: "-80px" }}` — elements enter with `y: 40 → 0`, `opacity: 0 → 1`.
- **Glass shimmer on hover:** A pseudo-element `::after` with a white gradient diagonal sweep (`translateX(-100%) → translateX(200%)`) plays once on card hover. Creates a "light reflection" effect.
- **Map route draw:** SVG path uses `stroke-dasharray` equal to path length, `stroke-dashoffset` animates from full length to 0 over 2s on load.
- **ETA countdown:** Seconds tick down with a subtle `scaleY(1.15) → scaleY(1)` bounce on each second change.

---

### Backend — Cloudflare Workers API (Hono.js)

**Base URL:** `https://api.swifthaul.workers.dev`

**D1 Schema:**

```sql
CREATE TABLE parcels (
  id TEXT PRIMARY KEY,           -- e.g. SH-2024-A7B3C9
  sender_name TEXT NOT NULL,
  sender_address TEXT NOT NULL,
  sender_country TEXT NOT NULL,
  receiver_name TEXT NOT NULL,
  receiver_address TEXT NOT NULL,
  receiver_country TEXT NOT NULL,
  weight_kg REAL,
  dimensions TEXT,               -- JSON: {l, w, h}
  service_type TEXT,             -- EXPRESS | STANDARD | FREIGHT
  declared_value REAL,
  current_status TEXT DEFAULT 'CREATED',
  eta TEXT,                      -- ISO date string
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE tracking_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  parcel_id TEXT NOT NULL REFERENCES parcels(id),
  event_type TEXT NOT NULL,      -- IN_TRANSIT | ARRIVED_HUB | OUT_FOR_DELIVERY | DELIVERED | EXCEPTION
  location TEXT,
  description TEXT,
  timestamp TEXT DEFAULT (datetime('now'))
);

CREATE TABLE admins (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT DEFAULT 'ADMIN'
);
```

**API Endpoints:**

```
GET  /api/track/:id              → Public. Returns parcel + all tracking events
POST /api/admin/login            → Returns signed JWT
GET  /api/admin/parcels          → Protected. List all parcels (paginated, filterable)
POST /api/admin/parcels          → Protected. Create new parcel (auto-generates ID)
PUT  /api/admin/parcels/:id      → Protected. Update parcel fields
POST /api/admin/parcels/:id/events → Protected. Add tracking event
DELETE /api/admin/parcels/:id    → Protected. Soft delete
GET  /api/admin/analytics        → Protected. Aggregated stats for dashboard
```

**Auth middleware:** Validate `Authorization: Bearer <jwt>` header on all `/api/admin/*` routes. Use `jose` library (works in Workers runtime). JWT secret stored in Worker environment variable.

**KV Caching:** Cache public tracking results in KV with a 60-second TTL. Key: `track:{parcel_id}`. On admin update, invalidate the key.

**Parcel ID generation:** Format `SH-{YEAR}-{6 random alphanumeric chars}`. Generated server-side on create.

---

### Cloudflare Deployment Configuration

**`wrangler.toml`:**
```toml
name = "swifthaul-api"
main = "src/worker.ts"
compatibility_date = "2024-01-01"

[[d1_databases]]
binding = "DB"
database_name = "swifthaul-db"
database_id = "<your-d1-id>"

[[kv_namespaces]]
binding = "TRACKING_CACHE"
id = "<your-kv-id>"

[vars]
ENVIRONMENT = "production"
```

**Cloudflare Pages:** Connect GitHub repo, build command `npm run build`, output directory `dist`. Set environment variable `VITE_API_BASE=https://api.swifthaul.workers.dev`.

**CORS:** Worker must return `Access-Control-Allow-Origin: https://swifthaul.pages.dev` and handle `OPTIONS` preflight.

---

### Additional Implementation Notes

- All glass elements must use `will-change: transform` where animated to enable GPU compositing
- Backdrop-filter requires a non-transparent parent background — ensure the aurora background layer always provides this
- Mobile: collapse sidebar to bottom navigation bar (glass strip, 5 icon tabs). All glass effects preserved. Touch targets minimum 44px.
- Respect `prefers-reduced-motion` — wrap all Framer Motion variants with a check and fall back to instant `opacity` only transitions
- Use React Query (TanStack Query) for all API data fetching — automatic caching, background refetch, and loading/error states
- Toast notifications (bottom-right): glass toast panel with icon, message, auto-dismiss progress bar (thin cyan line depletes left-to-right over 4s). Enter: slides in from right. Exit: slides out to right.
- 404 page: full aurora background, large glass card, "Lost in transit?" headline, back to home button

