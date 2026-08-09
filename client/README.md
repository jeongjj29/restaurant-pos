# Client (React + TypeScript + Vite)

## Run locally
```bash
npm ci
npm run dev
```

App defaults to `http://localhost:5173`. Start and seed the backend first by
following the root `README.md`, then sign in with `admin` / `password`.

## Build
```bash
npm run build
npm run preview
```

## Frontend structure
- `src/features/*`: domain-driven feature modules (`auth`, `orders`, `menu`, `employees`, `tables`, `payments`)
- `src/components/*`: shared layout and UI building blocks
- `src/app/*`: Redux store and app-level hooks/types
- `src/routes.tsx`: route tree and protected route composition

## API integration
Vite's development and preview servers proxy `/api/*` requests to
`http://localhost:5555/` (configured in `vite.config.js`).
