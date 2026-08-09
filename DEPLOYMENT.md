# Deployment and Operations Guide

This guide describes the repository's platform-neutral container deployment.
It assumes an internet-facing container host with managed PostgreSQL, managed
TLS, environment-variable secrets, and persistent log collection.

## Runtime architecture

The production image is intentionally same-origin:

1. The Node build stage compiles the Vite application.
2. The Python build stage installs the locked Python 3.12 dependencies.
3. The final non-root image runs Gunicorn on port `8080` by default.
4. WhiteNoise serves compiled, compressed Vite assets; Flask handles SPA deep
   links and the `/api` routes.
5. The application connects to PostgreSQL through Psycopg 3.

Keeping the UI and API on one origin avoids a cross-origin cookie dependency.
Authentication is stored in Secure, HttpOnly cookies and mutating requests use
double-submit CSRF protection. The TLS endpoint therefore belongs in front of
the container: do not expose the container's plain HTTP port directly to the
internet.

## Deployment checklist

Before the first deployment:

- Provision a PostgreSQL database with automated backups and, preferably,
  point-in-time recovery.
- Configure HTTPS and redirect HTTP to HTTPS at the platform load balancer or
  reverse proxy.
- Rate-limit `POST /api/auth/login` at the trusted edge and alert on sustained
  authentication failures.
- Generate a unique JWT secret and store it in the platform's secret manager.
- Set the required application environment variables below.
- Build the repository-root `Dockerfile` and expose the platform's assigned
  port (the image default is `8080`).
- Run the Alembic migration once against the production database.
- Create the initial administrator with the idempotent CLI command.
- Configure `/api/health` as liveness and `/api/ready` as readiness.
- Verify login, a SPA deep link, an order, and a payment over the public HTTPS
  URL.

## Required production configuration

Set these on the application service:

| Variable | Production value |
| --- | --- |
| `APP_ENV` | `production` |
| `DATABASE_URL` | PostgreSQL connection URL supplied by the database provider |
| `JWT_SECRET_KEY` | Unique random value of at least 32 characters |
| `JWT_COOKIE_SECURE` | `true` |

The application accepts URLs beginning with `postgres://`, `postgresql://`, or
`postgresql+psycopg://`; it selects the Psycopg driver automatically for the
first two forms. Preserve any provider-required query options such as
`sslmode=require`.

Generate a secret locally, then copy only the output into the platform's secret
manager:

```bash
python3 -c 'import secrets; print(secrets.token_urlsafe(48))'
```

Never commit the generated value. Rotating `JWT_SECRET_KEY` invalidates all
existing login cookies, which is useful during a suspected credential leak but
should otherwise be planned.

The image already sets `APP_ENV=production`, `CLIENT_DIST_DIR=/app/client`,
`JWT_COOKIE_SECURE=true`, `PORT=8080`, `RUN_MIGRATIONS=true`, and
`WEB_CONCURRENCY=2`. Declare the security-sensitive values explicitly in the
host configuration so their intended state remains visible.

## Generic managed-container procedure

The product names differ by host, but the deployment sequence is the same:

1. Create a managed PostgreSQL database in the same region as the application.
   Copy its private connection URL into `DATABASE_URL` when the host provides
   private networking.
2. Create a web service from this repository. Set the build context to the
   repository root and use the root `Dockerfile`; the image already defines its
   entrypoint and Gunicorn command, so no custom start command is needed.
3. Configure the service port from `PORT` (default `8080`). Do not add a
   persistent application filesystem: business data belongs in PostgreSQL and
   frontend assets are already baked into the image.
4. Add the required and recommended environment variables through the host's
   secret/configuration UI. Do not upload a populated `.env` to the image.
5. For one replica, allow the entrypoint to migrate before startup. For
   multiple replicas, configure the single release job described below before
   enabling automatic deploys.
6. Set the readiness path to `/api/ready` and the liveness path to
   `/api/health`. Allow enough startup time for migration retries.
7. Attach the public domain, enable the host's managed certificate, and force
   HTTPS. Configure proxy trust from the host's documented hop count and proxy
   addresses.
8. Deploy, create the administrator from a one-off shell, and complete the
   smoke test before directing production traffic to the service.

## Recommended application settings

| Variable | Default | Guidance |
| --- | ---: | --- |
| `TRUSTED_HOSTS` | unset | Comma-separated public hostnames, for example `pos.example.com`. Match the host values documented by the platform. The container probe automatically sends the first configured host. |
| `HEALTHCHECK_HOST` | first `TRUSTED_HOSTS` entry, then `127.0.0.1` | Optional Host header used by the image's loopback readiness probe. Set it when the first trusted host is not suitable for probes. |
| `TRUST_PROXY_COUNT` | `0` | Exact number of trusted reverse-proxy hops that set `X-Forwarded-For`, `X-Forwarded-Proto`, and `X-Forwarded-Host`. Do not guess or overstate this count. |
| `FORWARDED_ALLOW_IPS` | `127.0.0.1,::1` | Gunicorn proxy peers allowed to supply forwarded headers. Use the platform's documented proxy addresses. Use `*` only when the container cannot be reached except through a trusted proxy. |
| `JWT_COOKIE_SAMESITE` | `Lax` | Keep `Lax` for the same-origin deployment. `Strict` is more restrictive; `None` requires Secure cookies and a separately reviewed cross-site design. |
| `JWT_ACCESS_TOKEN_MINUTES` | `480` | Login-cookie lifetime in minutes. Shorten to match the operating environment. |
| `MIN_PASSWORD_LENGTH` | `12` | Minimum length for new or bootstrap user passwords; values below `8` are rejected. |
| `SALES_TAX_RATE` | `0.08875` | Decimal fraction from `0` through `1`; set this for the deployment's tax policy. The authenticated client reads this runtime value from the API. |
| `MAX_CONTENT_LENGTH` | `1048576` | Maximum request body size in bytes. |
| `DATABASE_POOL_RECYCLE_SECONDS` | `300` | Recycle interval for database connections. Match database/provider limits. |
| `CORS_ORIGINS` | unset | Leave unset for the supported same-origin topology. If needed, use only exact comma-separated origins; wildcard CORS is rejected in production. |

The current Content Security Policy permits API connections to the same origin.
A separately hosted frontend is not a drop-in configuration: review the CSP,
cookie attributes, CSRF behavior, and CORS settings together before splitting
the origins.

## Frontend build-time settings

Vite reads these while building the SPA, not when the final container starts:

| Variable | Production default | Guidance |
| --- | ---: | --- |
| `VITE_SHOW_DEMO_CREDENTIALS` | `false` | Never enable this on a public deployment; it displays and fills the known seeded credentials. Development mode shows the helper automatically. |
| `VITE_MIN_PASSWORD_LENGTH` | `12` | Client-side validation for employee creation. Keep it equal to the backend's `MIN_PASSWORD_LENGTH`. |

The current Dockerfile does not provide either variable, so its production
image deliberately uses the defaults above. Changing a runtime service
variable after the image is built has no effect on Vite code. Keep
`MIN_PASSWORD_LENGTH=12` for the standard image; a different value requires a
deliberately configured frontend build as well as the matching backend value.

## Gunicorn and startup settings

| Variable | Default | Purpose |
| --- | ---: | --- |
| `PORT` | `8080` | Port used by the default Gunicorn bind. Most platforms may inject this. |
| `BIND_ADDRESS` | `127.0.0.1` | Host address used only by the Compose port publication. Keep the loopback default unless a trusted TLS proxy requires another bind. |
| `GUNICORN_BIND` | `0.0.0.0:$PORT` | Full bind override. |
| `WEB_CONCURRENCY` | `2` | Gunicorn worker processes. |
| `GUNICORN_THREADS` | `2` | Threads per worker. |
| `GUNICORN_TIMEOUT` | `30` | Request timeout in seconds. |
| `GUNICORN_GRACEFUL_TIMEOUT` | `30` | Graceful shutdown timeout in seconds. |
| `GUNICORN_KEEPALIVE` | `5` | Keep-alive duration in seconds. |
| `GUNICORN_MAX_REQUESTS` | `1000` | Requests handled before recycling a worker. |
| `GUNICORN_MAX_REQUESTS_JITTER` | `100` | Random recycle jitter. |
| `GUNICORN_LOG_LEVEL` | `info` | Gunicorn log level. Access and error logs go to stdout/stderr. |

Start with the defaults, then size workers and threads from observed memory,
latency, and the database connection limit. Configure the platform to retain
stdout/stderr logs and alert on repeated 5xx responses or readiness failures.

## Migrations and release strategy

The container entrypoint runs this command before Gunicorn by default:

```bash
flask --app manage:app db upgrade
```

It retries while PostgreSQL starts. `MIGRATION_MAX_ATTEMPTS` defaults to `10`
and `MIGRATION_RETRY_DELAY_SECONDS` defaults to `3`. A failed migration stops
the container instead of starting against an old schema.

For a single-replica deployment, the default `RUN_MIGRATIONS=true` provides a
simple safe startup. For multiple replicas, do not let every replica race the
same migration:

1. Set `RUN_MIGRATIONS=false` on the application replicas.
2. Run one release job from the exact image being deployed, with
   `RUN_MIGRATIONS=false` and command
   `flask --app manage:app db upgrade`.
3. Deploy or restart application replicas only after that job succeeds.

Check the applied revision from a one-off shell when needed:

```bash
flask --app manage:app db current
```

Alembic upgrades the target database schema; it does not copy rows from the
local SQLite database into PostgreSQL. Deploy with a fresh PostgreSQL database,
or use a separately tested export/import plan when existing local data must be
preserved.

Take a recoverable database backup before each schema migration. Test restores
regularly; an untested backup is not a rollback plan.

## Initial administrator

After migrations, open a one-off shell in the running image and execute:

```bash
flask --app manage:app create-admin
```

The command prompts for username, email, and a hidden, confirmed password.
Names default to `System Administrator`; supply `--first-name` and
`--last-name` to change them. It ensures the standard Admin, Manager, Chef,
Server, and Bartender roles exist, then creates the administrator at access
level 5. Running it again reports success only when the username and email
identify the same existing level-5 administrator. Partial collisions and
non-admin accounts are rejected without changing the existing account.

For a non-interactive platform job, the accepted variables are
`ADMIN_USERNAME`, `ADMIN_EMAIL`, `ADMIN_FIRST_NAME`, `ADMIN_LAST_NAME`, and
`ADMIN_PASSWORD`. Treat `ADMIN_PASSWORD` as a temporary secret: inject it only
for the one-off job and remove it immediately afterward. Do not store it as a
permanent application variable or place it in a command line or repository
file.

## Demo seed safeguards

Production seeding has two independent gates:

- `SEED_DATABASE=true` asks the container entrypoint to invoke the seed.
- `ALLOW_DEMO_SEED=true` allows the Flask command to run under
  `APP_ENV=production`.

Both default to `false` at the deployment level. Leave them false for real
restaurant or customer data. The bundled seed creates known accounts
(`admin`, `manager`, and `waiter`) with the known password `password`; enabling
it on a public deployment creates an immediate credential risk.

If an isolated, disposable portfolio environment intentionally uses the seed,
restrict public access, rotate or remove every seeded account before opening
access, and return `SEED_DATABASE` and `ALLOW_DEMO_SEED` to `false` after the
one-time operation. The seed is non-destructive and repeatable, but that does
not make its credentials production-safe.

## Health checks and smoke test

The two unauthenticated checks have different meanings:

- `GET /api/health` is liveness. It reports that the Flask process can answer.
- `GET /api/ready` is readiness. It executes `SELECT 1` against PostgreSQL and
  returns `503` when the database is unavailable.

Use `/api/ready` to decide whether a replica receives traffic. Use
`/api/health` for a liveness restart policy unless the platform has a specific
reason to restart processes during a database outage. The image's Docker
`HEALTHCHECK` uses readiness, connects over loopback, and chooses its Host
header from `HEALTHCHECK_HOST`, the first `TRUSTED_HOSTS` entry, or
`127.0.0.1`, in that order. Platform-managed probes may send a different Host;
include it in `TRUSTED_HOSTS` or configure the platform's probe header.

After deployment, test the public HTTPS URL:

```bash
curl --fail --show-error --silent https://pos.example.com/api/health
curl --fail --show-error --silent https://pos.example.com/api/ready
curl --fail --show-error --silent https://pos.example.com/orders/dinein
```

The deep-link response should contain the SPA HTML. Then use a browser to log
in, create a test order, add an item, record a payment, log out, and confirm
that the protected UI requires a new login.

## Production-like Docker Compose smoke test

The included Compose stack starts PostgreSQL 17 and the production image. It is
for local validation and CI, not an internet-facing TLS edge.

From the repository root:

```bash
cp deployment.env.example .env
python3 -c 'import secrets; print("POSTGRES_PASSWORD=" + secrets.token_urlsafe(36)); print("JWT_SECRET_KEY=" + secrets.token_urlsafe(48))'
docker compose -f compose.production.yml up --build --detach --wait
curl --fail --show-error http://127.0.0.1:8080/api/health
curl --fail --show-error http://127.0.0.1:8080/api/ready
```

Before `docker compose up`, copy both generated URL-safe values into the ignored
root `.env`. Compose publishes plain HTTP;
because production authentication cookies are Secure, validate login through
the real HTTPS deployment rather than treating port `8080` as a browser-ready
production endpoint.

Create an administrator interactively in the running Compose app:

```bash
docker compose -f compose.production.yml exec app flask --app manage:app create-admin
```

For a disposable stack, the same lifecycle check used by CI can then verify
login cookies, runtime tax, concurrent table occupancy, atomic order creation,
exact payment, closure, revocation, and PostgreSQL behavior:

```bash
export SMOKE_USERNAME=your-admin
read -rsp "Smoke admin password: " SMOKE_PASSWORD
export SMOKE_PASSWORD
python3 scripts/production_smoke.py
unset SMOKE_PASSWORD
```

The script creates uniquely named test menu/table/order records. Run it only
against a disposable or explicitly approved verification environment.

Inspect logs and stop the stack without deleting its database volume:

```bash
docker compose -f compose.production.yml logs --no-color app
docker compose -f compose.production.yml down
```

Adding `--volumes` to `down` deletes the local PostgreSQL volume and all of its
data; use that flag only for an intentionally disposable smoke database.

## Backups, rollback, and scaling

- Enable managed PostgreSQL snapshots and point-in-time recovery. Record the
  retention window and rehearse restoration into a separate database.
- Back up immediately before migrations and other bulk data changes.
- Deploy immutable image tags or digests and retain the previously known-good
  image for application rollback.
- A code rollback does not automatically roll back the schema. Prefer
  forward-compatible migrations. If an older image is incompatible with the
  new schema, use a reviewed recovery procedure or restore the pre-migration
  backup; do not run `db downgrade` blindly against live data.
- Run migrations once per release, not once per replica. Application replicas
  share PostgreSQL-backed state and do not require sticky sessions.
- Increase Gunicorn concurrency only after checking container memory and the
  database's maximum connections. Load-test the order and payment workflows
  before relying on a new replica count.

## Go-live verification

Confirm all of the following before directing users to the deployment:

- The public URL is HTTPS-only and sends the expected security headers.
- `TRUST_PROXY_COUNT`, `FORWARDED_ALLOW_IPS`, and `TRUSTED_HOSTS` match the
  actual network topology.
- The trusted edge rate-limits login attempts and authentication-failure alerts
  reach an operator.
- `/api/health` and `/api/ready` are healthy, and readiness fails when database
  access is intentionally removed in a staging exercise.
- Migrations report the expected current revision.
- A non-seeded administrator can log in, and authorization hides or rejects
  actions above a user's role.
- Secure authentication and CSRF cookies are present; no bearer token is stored
  in browser local storage.
- Backups, log retention, alerts, and a previous image rollback are configured
  and have an owner.
- `SEED_DATABASE` and `ALLOW_DEMO_SEED` are false.
