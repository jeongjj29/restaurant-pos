# Restaurant POS Application

A full-stack restaurant point-of-sale demo for dine-in and takeout orders,
payments, menu management, employees, tables, and live sales summaries.

## Demo highlights

- Authenticated dashboard with a seeded local demo account
- Dine-in floor view and takeout order entry
- Partial or full payment settlement with automatic order closing
- Menu, employee, role, and table management
- Live revenue, ticket, order-status, and payment-method summaries
- Idempotent, non-destructive demo seeding

## Tech stack

- Frontend: React 19, TypeScript, Vite, Redux Toolkit, MUI
- Backend: Flask, SQLAlchemy, Alembic/Flask-Migrate, JWT
- Local demo data: SQLite

## Quick start

Prerequisites: Node.js 20, Python 3.8, and Pipenv.

### 1. Start the backend

```bash
cd server
cp .env.example .env
pipenv sync --dev
pipenv run flask --app manage db upgrade
pipenv run flask --app manage seed
pipenv run python manage.py
```

The API runs at `http://localhost:5555`; its health endpoint is
`http://localhost:5555/api/health`.

Run migrations before the seed command. Seeding can be run again safely: it
merges the bundled demo catalog and users without dropping existing data, and
only creates the sample orders when the database has no orders.

### 2. Start the frontend

In a second terminal:

```bash
cd client
npm ci
npm run dev
```

Open `http://localhost:5173`. Vite proxies `/api` requests to the backend on
port 5555.

### 3. Sign in

- Username: `admin`
- Password: `password`

The login page also has a **Fill demo credentials** button. It fills the form
without submitting it.

## Suggested demo walkthrough

1. Sign in and show the dashboard counts.
2. Open **Orders → Dine-In**. Table 2 contains the seeded open order; another
   table starts a new order.
3. Open **Orders → All Orders**, select an open order, and settle it. Partial
   payments keep it open; the exact remaining payment closes it.
4. Open **Settings → Reports** to show recorded revenue and payment mix.
5. Use **Settings → Menu**, **Employees**, or **Tables** to demonstrate
   create/edit flows and floor-layout management.

The seed also includes one paid takeout order so reports are populated on first
launch.

## Configuration

`server/.env.example` uses SQLite for a zero-service local start. The relative
database URL is stored by Flask under `server/instance/restaurant_pos.db`.
Set `DATABASE_URL`, `JWT_SECRET_KEY`, or `PORT` to override those defaults.

The development commands and credentials above are for a local portfolio demo,
not a production deployment. A deployed environment should use a strong JWT
secret, a production WSGI server, a managed database/driver, HTTPS, and explicit
authorization policy for domain routes.

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
pipenv run black --check app tests
pipenv run ruff check app tests
pipenv run coverage run -m unittest discover -s tests -p "test_*.py"
pipenv run coverage report --fail-under=70
```

CI runs these checks on every pull request and push to `main`.

## Project structure

- `client/`: React SPA organized by feature (`auth`, `orders`, `menu`,
  `employees`, `tables`, `payments`)
- `server/app/`: Flask application, domain blueprints, and SQLAlchemy models
- `server/migrations/`: Alembic schema history
- `server/seed.py`: repeatable local demo data
