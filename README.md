# Nuxt Movie Booking

A full-stack movie ticket booking app built to learn **Nuxt 4**, **Pinia**, and **Oracle Database** end-to-end — browse movies and showtimes, pick a seat, and book a ticket, backed by real relational persistence.

> ✅ Core booking loop working end-to-end: browse movies, pick a showtime and seat, book, and cancel — backed by Oracle. See [Roadmap](#roadmap) for what's next.

## Stack

- **[Nuxt 4](https://nuxt.com/)** — Vue framework: file-based routing, auto-imports, and a built-in server (Nitro)
- **[Pinia](https://pinia.vuejs.org/)** — state management for the frontend
- **[Oracle Database](https://www.oracle.com/database/)** (XE, via Docker) — persistence, accessed through [`node-oracledb`](https://node-oracledb.readthedocs.io/) in Thin mode (no Oracle Instant Client required)
- **TypeScript** throughout

## Architecture

```
Vue components (app/)
       │  Pinia store (app/stores/)
       ▼
Nitro API routes (server/api/)
       │  server/utils/db.ts — connection pool
       ▼
Oracle Database (Docker container)
```

## Getting started

### Prerequisites

- Node.js 22+
- Docker Desktop (for the local Oracle database)

### 1. Start the database

```bash
docker run -d \
  --name oracle-xe \
  -p 1521:1521 \
  -e ORACLE_PASSWORD=<sys-password> \
  -e APP_USER=movie_app \
  -e APP_USER_PASSWORD=<app-password> \
  gvenzl/oracle-xe:latest
```

First boot takes a minute or two — check readiness with `docker logs -f oracle-xe` until you see `DATABASE IS READY TO USE!`.

### 2. Configure environment variables

Copy `.env.example` to `.env` and fill in your own values:

```
NUXT_ORACLE_USER=movie_app
NUXT_ORACLE_PASSWORD=<app-password>
NUXT_ORACLE_CONNECT_STRING=localhost:1521/XEPDB1
```

### 3. Create the schema

Run [`db/schema.sql`](db/schema.sql) against the app schema (creates `movies`, `showtimes`, `bookings`, and seeds a few sample movies and showtimes):

```bash
sqlplus movie_app/<app-password>@localhost:1521/XEPDB1 @db/schema.sql
```

### 4. Install and run

```bash
npm install
npm run dev
```

App runs at `http://localhost:3000`.

## Data model

- **theaters** — a cinema location (name, city)
- **movies** — title, genre, duration, trending flag for the homepage hero
- **showtimes** — a movie playing at a theater/hall at a specific time, with a price and seat count
- **customers** — a mock account (name, email — no password)
- **bookings** — a customer's seat reservation for a showtime (one seat per booking; a showtime/seat pair can only be booked once)
- **promotions** — homepage marketing content (combo deals, discounts)

## Auth

Login is intentionally simple for this learning project: give a name and email, and the app finds or creates a `customers` row and remembers you via an httpOnly cookie (`customer_id`). There's no password — good enough to demo per-user ownership (only you can cancel your own booking), not meant for production use.

## Roadmap

- [x] Nuxt project scaffold
- [x] Oracle DB running locally via Docker
- [x] Server-side connection pool (`server/utils/db.ts`)
- [x] Database schema (`theaters`, `movies`, `showtimes`, `customers`, `bookings`, `promotions`)
- [x] CRUD API routes (`server/api/`)
- [x] Pinia store wired to the API
- [x] UI: movie list, showtime picker, seat selection, booking confirmation
- [x] Prevent double-booking a seat (unique constraint + 409 response)
- [x] Styling pass (cinema dark theme)
- [x] Form validation / nicer error states
- [x] Book multiple seats in one transaction (atomic — all seats book or none)
- [x] Multiple theater locations, showtimes grouped by theater
- [x] Mock login/logout (cookie-based customer session)
- [x] Cancel-my-own-booking only (server-enforced 403 + hidden in UI)
- [x] Navbar with search
- [x] Hero banner for trending movies
- [x] Genre filter
- [x] Promotions section
- [ ] Real password-based accounts (if this ever needs to be more than a demo)
- [ ] Admin UI for adding movies/showtimes (currently SQL-only)
- [ ] Block booking showtimes that have already started

## License

MIT
