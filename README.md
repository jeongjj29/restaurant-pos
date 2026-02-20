# Restaurant POS Application

Full-stack restaurant point-of-sale (POS) system for managing dine-in/takeout orders, menu/catalog operations, employees, tables, and payments.

## Project highlights
- End-to-end product scope: authentication, operations dashboard, order lifecycle, and payments.
- Scalable feature structure: domain-based frontend slices and RESTful backend blueprints.
- Production-minded backend behaviors: JWT token revocation and `/api/health` health-check endpoint.
- Automated verification: backend integration tests for auth flow and health endpoint.
- CI quality gates: GitHub Actions validates frontend build and backend tests on pushes/PRs.

## Tech stack
- Frontend: React 19, TypeScript, Vite, Redux Toolkit, MUI, DnD Kit
- Backend: Flask, SQLAlchemy, Alembic/Flask-Migrate, Flask-JWT-Extended
- Data: PostgreSQL (recommended), SQLite (local tests)

## Architecture
- `client/`: React SPA with feature-based modules (`auth`, `orders`, `menu`, `employees`, `tables`, `payments`)
- `server/`: Flask API with blueprint-per-domain routing and SQLAlchemy models
- `server/migrations/`: Alembic migrations for schema evolution

## Core features
- Role-based employee management and authentication
- Dine-in and takeout order flows
- Table management with drag-and-drop layout interactions
- Menu and category management
- Payment tracking and sales reporting

## Quick start
### 1) Backend
```bash
cd server
cp .env.example .env
pipenv install
pipenv run flask db upgrade
pipenv run python manage.py
```
Backend runs on `http://localhost:5555`.

### 2) Frontend
```bash
cd client
npm install
npm run dev
```
Frontend runs on `http://localhost:5173` and proxies API traffic to the backend.

## Backend environment variables
See `server/.env.example`.

## API overview
- `GET /api/health`: health status
- `POST /api/auth/login`: login
- `POST /api/auth/logout`: logout (JWT revocation)
- `GET /api/auth/protected`: authenticated test route
- Domain APIs: `/api/orders`, `/api/order_items`, `/api/menu_items`, `/api/menu_categories`, `/api/tables`, `/api/payments`, `/api/users`, `/api/roles`, `/api/discounts`

## Testing
Run backend integration tests:
```bash
cd server
pipenv run python -m unittest discover -s tests -p "test_*.py"
```

Run frontend quality checks:
```bash
cd client
npm install
npm run lint
npm run typecheck
npm run test
```

## CI
CI runs on each push to `main` and every pull request:
- `client-quality`: runs frontend lint, typecheck, tests, and build
- `server-tests`: installs Pipenv dependencies and runs backend integration tests
