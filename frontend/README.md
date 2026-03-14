# Automated Environmental Gateway Frontend

This frontend is a Vite + React + TypeScript app aligned to the Figma dashboard design and connected to the backend APIs.

## Setup
1. Install dependencies:
   - `npm install`
2. Start dev server:
   - `npm run dev`
3. Build for production:
   - `npm run build`
4. Preview production build:
   - `npm run preview`

## Environment Variables
- `VITE_API_BASE_URL` controls the backend base URL.
- Default value in `.env` is `http://localhost:3000/api/v1`.

## Folder Structure
- `src/components/`: Reusable UI components (cards, tables, dialogs, charts)
- `src/pages/`: One page per sidebar module
- `src/services/`: API clients for each backend module
- `src/types/`: DTOs aligned to backend/Figma fields
- `src/utils/`: Shared helpers (API client, formatters)
- `src/styles/`: Global theme and Tailwind layers

## Theme
- `src/styles/theme.css` defines CSS variables and Tailwind layers.
- Tailwind config is in `tailwind.config.ts`.

## Backend Connection
- All services call `/api/v1/...` endpoints.
- Pages display loading and error states when data is unavailable.

