# StartupForge AI — Frontend

## Run locally
1. Backend must be running on http://localhost:4000 (`cd backend && npm run dev`)
2. In another terminal:
   cd frontend
   npm install
   npm run dev
3. Open http://localhost:5173

Dev server proxies /api → localhost:4000, so no CORS setup needed locally.

## Production build
npm run build   (output in dist/)
Set VITE_API_URL env var to your deployed backend URL when building for production.
