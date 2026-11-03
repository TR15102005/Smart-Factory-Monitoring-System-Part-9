# SmartFactory Monitor — Smart Factory Monitoring System (MERN)

A full-stack **MERN** (MongoDB · Express · React · Node) monitoring system for collaborative
factory workspaces. It visualizes **Zone Layout & Occupancy** in real time to improve
**worker safety**, **robot utilization** and **compliance** across multiple factory zones.

![stack](https://img.shields.io/badge/stack-MERN-22c55e) ![node](https://img.shields.io/badge/node-18%2B-339933) ![license](https://img.shields.io/badge/license-MIT-blue)

---

## Features

- **Secure login page** with two actions — **Log In** and **Create New User** — plus a seeded
  default admin account (shown on the login screen).
- **Sidebar console** with 11 sections, a live clock, an open-incident alert bell and role-aware
  navigation (Admin section only appears for `admin` users).
- **Live Factory Zone Map** (Zone Layout page): dark industrial floor map with zone polygons,
  occupancy chips, moving worker dots, robot fleet, hatched hazard zones, pulsing gas alerts,
  spinning vent shafts, dispatched response teams, legend bar, compass + scale bar,
  zoom / reset / layer controls, fullscreen mode and a per-zone detail panel
  (occupancy, robotics, alerts, compliance note).
- **Operations Dashboard**: KPI cards (workers on floor, robot utilization, active alerts,
  compliance score), zone occupancy table with capacity bars and a live safety-alert feed.
- **Workers**: roster with EMP-IDs, live floor presence, status chips, search + status/zone
  filters and an Add Worker form (new workers join the live simulation immediately).
- **Robots**: fleet table with RB-IDs, live status, battery bars, uptime and an Add Robot form.
- **Safety Monitoring**: severity-tagged incident feed with Mark Resolved, status/severity
  filters, a 7-day incidents-by-zone chart and a Report Incident form.
- **Alerts & Maintenance**: work-order table (preventive / corrective / calibration) with
  schedule form and SCHEDULED → IN_PROGRESS → COMPLETED progression.
- **Analytics**: dependency-free SVG charts — utilization trend, fleet status donut, daily
  incidents by severity (stacked), weekly trend, operating hours, alert frequency by zone and
  maintenance response times.
- **Standards & Compliance**: ISO / ANSI / OSHA audit cards, worker certification expiry
  (VALID / EXPIRING / EXPIRED) and a per-zone compliance snapshot.
- **Reports**: generate snapshot reports and browse / preview the archive.
- **Settings**: workspace name, timezone, theme, shift handover and alert email.
- **Admin** (admin-only): user table, Create New User form and a system overview.
- **Live backend simulation**: workers and robots move between zones, batteries drain and
  recharge, gas alerts raise and dispatch response teams, occupancy / utilization / compliance
  are recomputed every tick.
- **JWT authentication** with bcrypt-hashed passwords and role-based accounts
  (`admin`, `supervisor`).
- **Zero-config demo mode**: if MongoDB is unreachable the API automatically falls back to an
  in-memory store so the app always runs; connect MongoDB for persistence.

## Default account

| Role  | Email             | Password  |
| ----- | ----------------- | --------- |
| admin | `admin@factory.io`| `admin123`|

Change it via `ADMIN_EMAIL` / `ADMIN_PASSWORD` in `server/.env` before first boot.

## Tech stack

| Layer    | Technology                                          |
| -------- | --------------------------------------------------- |
| Database | MongoDB + Mongoose                                   |
| API      | Node.js + Express, JWT (`jsonwebtoken`), `bcryptjs`  |
| Client   | React 18 + Vite + React Router                       |
| Live data| Server-side simulation polled over REST (`/api/zones/live`) |

## Project structure

```
smart-factory-monitor/
├── package.json              # root scripts (setup / dev / build)
├── .gitignore
├── README.md
├── vercel.json               # Vercel build/output + /api rewrite + SPA fallback
├── api/index.js              # Vercel serverless entrypoint (imports server/src/app.js)
├── server/                   # Express + MongoDB API
│   ├── package.json
│   ├── .env.example
│   └── src/
│       ├── index.js          # local/Render entry: bootstrap + listen (port 5001 default)
│       ├── app.js            # Express app (routes + optional static client), importable
│       ├── bootstrap.js      # idempotent startup: connect DB, seed, start simulation
│       ├── config/db.js      # Mongo connect + in-memory fallback
│       ├── models/           # User, Zone, Worker, Robot, Incident,
│       │                     # MaintenanceRecord, Report, Certification, Setting
│       ├── data/layout.js    # factory floor definition (zones, hazards, vents…)
│       ├── data/seedData.js  # demo dataset (relative dates so charts stay meaningful)
│       ├── middleware/auth.js# JWT sign / verify + requireAuth / requireAdmin
│       ├── routes/           # auth, zones, workers, robots, safety (incidents),
│       │                     # maintenance, analytics, compliance, reports, users, settings
│       └── services/         # store.js (dual-mode persistence), simulation.js (live floor)
└── client/                   # React dashboard
    ├── package.json
    ├── vite.config.js        # dev proxy /api → http://localhost:5001
    ├── index.html
    └── src/
        ├── main.jsx / App.jsx
        ├── api/client.js     # fetch wrapper + token storage + all endpoints
        ├── context/AuthContext.jsx
        ├── hooks/useLive.js  # polls /api/zones/live
        ├── hooks/useFetch.js # one-shot loader with reload
        ├── lib/format.js     # zone labels + date/relative-time helpers
        ├── components/       # AppShell (sidebar), ui.jsx, icons, charts/ (SVG), map/
        ├── pages/            # Login, Dashboard, ZoneLayout, Workers, Robots, Safety,
        │                     # Maintenance, Analytics, Compliance, Reports, Settings, Admin
        └── styles/global.css # dark industrial theme
```

## Quick start

Prerequisites: **Node 18+**, npm. MongoDB is optional (local, Docker or Atlas) — without it
the API runs in in-memory demo mode.

```bash
# 1. install everything (root + server + client)
npm run setup

# 2. (optional) configure environment
cp server/.env.example server/.env

# 3. (optional) start MongoDB, e.g. with Docker
docker run -d --name factory-mongo -p 27017:27017 mongo:7

# 4. run API + client together
npm run dev
```

Then open **http://localhost:5173** and log in with the default admin account.

| Service | URL                          |
| ------- | ---------------------------- |
| Client  | http://localhost:5173        |
| API     | http://localhost:5001        |
| Health  | http://localhost:5001/api/health |

### Environment variables (`server/.env`, all optional)

| Variable         | Default                                            | Purpose                       |
| ---------------- | -------------------------------------------------- | ----------------------------- |
| `PORT`           | `5001`                                             | API port                      |
| `MONGO_URI`      | `mongodb://127.0.0.1:27017/smart_factory_monitor`  | MongoDB connection string     |
| `JWT_SECRET`     | dev-only secret                                    | token signing secret          |
| `ADMIN_EMAIL`    | `admin@factory.io`                                 | seeded admin login            |
| `ADMIN_PASSWORD` | `admin123`                                         | seeded admin password         |

> If port `5001` is taken on your machine, set `PORT` (and the proxy target in
> `client/vite.config.js`) to any free port.

## API overview

All authenticated routes expect `Authorization: Bearer <token>`.

| Method | Endpoint                      | Auth  | Description                                    |
| ------ | ----------------------------- | ----- | ---------------------------------------------- |
| POST   | `/api/auth/register`          | –     | create a supervisor account, returns JWT       |
| POST   | `/api/auth/login`             | –     | login, returns JWT + user                      |
| GET    | `/api/auth/me`                | ✔     | current user                                   |
| GET    | `/api/zones`                  | ✔     | static zone layout, hazards, vents, corridors  |
| GET    | `/api/zones/live`             | ✔     | live snapshot: zones, workers, robots, alerts, teams, summary |
| GET    | `/api/workers`                | ✔     | roster merged with live zone / on-floor state  |
| POST   | `/api/workers`                | ✔     | add worker (auto EMP-id, joins simulation)     |
| PATCH  | `/api/workers/:id`            | ✔     | update status / zone (syncs simulation)        |
| GET    | `/api/robots`                 | ✔     | fleet merged with live status / battery / task |
| POST   | `/api/robots`                 | ✔     | add robot (auto RB-id)                         |
| PATCH  | `/api/robots/:id`             | ✔     | update status / zone                           |
| GET    | `/api/incidents`              | ✔     | incident feed (`?status=&severity=`) + open counts |
| GET    | `/api/incidents/stats`        | ✔     | 7-day by zone + 14-day stacked by severity     |
| POST   | `/api/incidents`              | ✔     | report an incident                             |
| POST   | `/api/incidents/:id/resolve`  | ✔     | mark an incident resolved                      |
| GET    | `/api/maintenance`            | ✔     | maintenance work orders                        |
| POST   | `/api/maintenance`            | ✔     | schedule a work order                          |
| PATCH  | `/api/maintenance/:id`        | ✔     | advance work-order status                      |
| GET    | `/api/analytics`              | ✔     | all chart series (utilization, incidents, hours…) |
| GET    | `/api/compliance`             | ✔     | standards, certifications, zone snapshot       |
| GET    | `/api/reports`                | ✔     | report archive                                 |
| GET    | `/api/reports/:id`            | ✔     | single report                                  |
| POST   | `/api/reports`                | ✔     | generate a snapshot report                     |
| GET    | `/api/settings`               | ✔     | workspace settings                             |
| PUT    | `/api/settings`               | ✔     | update workspace settings                      |
| GET    | `/api/users`                  | admin | user list + system overview                    |
| POST   | `/api/users`                  | admin | create a user (admin or supervisor)            |
| GET    | `/api/health`                 | –     | service + storage-mode health check            |

## Deploying to GitHub

The repository is deployment-ready: dependencies are declared per package, secrets are kept in
`.env` (git-ignored), and build output is ignored.

```bash
git init
git add .
git commit -m "SmartFactory Monitor: MERN zone layout & occupancy monitoring"
git branch -M main
git remote add origin https://github.com/<your-username>/<your-repo>.git
git push -u origin main
```

### Hosting suggestions

- **API**: Render / Railway / Fly.io — set `MONGO_URI` (MongoDB Atlas free tier works great),
  `JWT_SECRET`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`; start command `npm start` in the `server/` folder.
- **Client**: Vercel / Netlify — build command `npm run build`, output `client/dist`;
  add a rewrite so `/api/*` points to your hosted API (or set `VITE_API_URL`).
- **All-in-one**: run `npm start` (API) and serve `client/dist` statically from Express if you
  prefer a single host.

## Deploying to Vercel (frontend + backend on one project)

The repo is pre-wired for a single Vercel project that serves the React client **and** runs the
Express API as a serverless function on the same origin (so the client's relative `/api/*` calls
just work — no CORS, no `VITE_API_URL`).

What makes it work:

- `api/index.js` — Vercel Node entrypoint that imports the shared Express app (`server/src/app.js`)
  and calls `bootstrap()` (connect storage, seed demo data, start the live simulation) once per
  warm instance.
- `vercel.json` — builds `client/` into `client/dist`, sets that as the static output, rewrites
  `/api/*` to the function and every other path to `index.html` (React Router SPA fallback).
- `server/src/app.js` / `server/src/bootstrap.js` — the app is split from the listen loop, so the
  same code runs locally (`npm start`), on Render (single service) and on Vercel (serverless).

Steps:

1. Push this repo to GitHub.
2. In Vercel → **Add New → Project**, import the repo. **Leave Root Directory blank** (repo root)
   so both `api/` and `client/` are seen; `vercel.json` supplies the build/output settings.
3. Add environment variables: `MONGO_URI` (MongoDB Atlas), `JWT_SECRET`, `ADMIN_EMAIL`,
   `ADMIN_PASSWORD`. Do **not** set `PORT` — Vercel manages it.
4. Deploy. The app is live at `https://<project>.vercel.app`.

> **Serverless caveat:** functions are ephemeral, so use **MongoDB Atlas** for persistence — the
> in-memory fallback resets on every cold start. The live simulation only ticks while an instance
> is warm; on the free tier the project sleeps after inactivity, so the first request is slower and
> the simulated floor re-seeds. For a continuously-live floor, host the API on Render/Railway/Fly
> (persistent process) and deploy only `client/` to Vercel with an `/api/*` rewrite to that API.

## Scripts

| Command         | Runs                                             |
| --------------- | ------------------------------------------------ |
| `npm run setup` | installs root + server + client dependencies     |
| `npm run dev`   | API (nodemon) + client (Vite) concurrently       |
| `npm start`     | production API (`node src/index.js`)             |
| `npm run build` | production client bundle (`client/dist`)         |

## License

MIT — free to use for coursework, demos and production experiments.
