# Restaurant POS Application

A full-stack restaurant point-of-sale demo for dine-in and takeout orders,
payments, menu management, employees, tables, and live sales summaries.

## Demo highlights

- Authenticated dashboard with role-based access
- Dine-in floor view and takeout order entry
- Partial or full payment settlement with automatic order closing
- Menu, employee, and table management with role-aware permissions
- Live revenue, ticket, order-status, and payment-method summaries
- Idempotent sample seeding plus a guarded, deterministic demo reset

## Tech stack

- Frontend: React 19, TypeScript, Vite, Redux Toolkit, MUI
- Backend: Flask, Gunicorn, SQLAlchemy, Alembic/Flask-Migrate, cookie-based JWT
- Production: one Docker image serving the Vite SPA and API, PostgreSQL
- Local development: separate Vite and Flask processes, SQLite

## Local quick start

Prerequisites: Node.js 20 or 22, Python 3.12, and Pipenv.

### 1. Start the backend

```bash
cd server
cp .env.example .env
pipenv sync --dev
pipenv run flask --app manage:app db upgrade
pipenv run flask --app manage:app seed
pipenv run python manage.py
```

The API runs at `http://localhost:5555`. Check it at
`http://localhost:5555/api/health`.

Run migrations before seeding. The seed can be run again safely: it merges the
bundled demo catalog and limited public account without dropping existing data,
and it creates sample orders only when the database has no orders.

### 2. Start the frontend

In a second terminal:

```bash
cd client
npm ci
npm run dev
```

Open `http://localhost:5173`. Vite proxies `/api` requests to Flask on port
5555.

### 3. Sign in

- Username: `demo`
- Password: `restaurant-demo`

The login page also has a **Fill demo credentials** button. It fills the form
without submitting it. The shared account has Server-level access: visitors can
exercise order and payment flows, but cannot manage users, roles, menu items, or
tables.

## Suggested demo walkthrough

1. Sign in and show the dashboard counts.
2. Open **Orders -> Dine-In**. Table 2 contains the seeded open order; another
   table starts a new order.
3. Open **Orders -> All Orders**, select an open order, and settle it. Partial
   payments keep it open; the exact remaining payment closes it.
4. Use a separately created, private administrator when presenting **Settings**,
   reports, menu, employee, or table management. Never publish that password.

The seed also includes one paid takeout order so reports are populated on first
launch.

## Production deployment

The root `Dockerfile` builds the Vite client, installs locked Python
dependencies, and produces a non-root Gunicorn container. Flask and WhiteNoise
serve the SPA and `/api` from one origin; PostgreSQL is required in production.

Use the complete [deployment and operations guide](DEPLOYMENT.md) before
publishing the app. In particular, production requires:

- a unique JWT secret of at least 32 characters;
- PostgreSQL;
- HTTPS at the platform or reverse proxy, because authentication uses Secure,
  HttpOnly cookies;
- database migrations and an initial administrator;
- provider-managed backups, logs, and health checks.

For a public portfolio deployment, keep PostgreSQL because stateful order and
payment behavior is part of the demo, but use a dedicated disposable database
that contains no real data. The production image enables application-level rate
limits, uses one-hour login cookies, disables automatic seed/reset operations,
and displays a warning not to enter real customer or payment information.

After deploying a new demo baseline, remove older seeded privileged accounts by
running the guarded reset described in [DEPLOYMENT.md](DEPLOYMENT.md). This is a
destructive operation and should only target the isolated demo database.

`compose.production.yml` is useful for a production-like local smoke test. Its
published port is plain HTTP, so it is not an internet-ready TLS edge and should
not be used as one.

## Configuration

`server/.env.example` contains safe local-development defaults. The relative
SQLite URL is stored by Flask under `server/instance/restaurant_pos.db`.

Do not reuse that file for production. Production environment variables,
container commands, migration strategy, proxy settings, and rollback guidance
are documented in [DEPLOYMENT.md](DEPLOYMENT.md). A non-secret Compose template
is available at [`deployment.env.example`](deployment.env.example).

## Verification

Frontend quality gates:

```bash
cd client
npm ci
npm run lint
npm run typecheck
npm run test
npm run build
```

Backend quality gates:

```bash
cd server
pipenv sync --dev
pipenv run black --check app tests wsgi.py gunicorn.conf.py
pipenv run ruff check app tests wsgi.py gunicorn.conf.py
pipenv run coverage run -m unittest discover -s tests -p "test_*.py"
pipenv run coverage report --fail-under=70
```

CI runs the frontend and backend gates and a PostgreSQL container smoke test on
every pull request and push to `main`.

## Project structure

- `client/`: React SPA organized by feature (`auth`, `orders`, `menu`,
  `employees`, `tables`, `payments`)
- `server/app/`: Flask application, domain blueprints, and SQLAlchemy models
- `server/migrations/`: Alembic schema history
- `server/seed.py`: repeatable local demo data
- `Dockerfile`: multi-stage production image
- `compose.production.yml`: production-like PostgreSQL/container smoke stack
- `scripts/production_smoke.py`: authenticated PostgreSQL order/payment smoke test
