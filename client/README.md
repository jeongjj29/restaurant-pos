# Client (React + TypeScript + Vite)

## Run locally
```bash
npm install
npm run dev
```

App defaults to `http://localhost:5173`.

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
Vite dev server proxies `/api/*` requests to `http://localhost:5555/` (configured in `vite.config.js`).
