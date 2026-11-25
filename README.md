# bash-or-burn-webapp

## Commands

Use the pinned Node version first: `nvm use` (see `.nvmrc`).

- `npm install`: install dependencies
- `npm run dev`: start the dev server
- `npm run build`: type-check and build the static site into `dist`
- `npm run preview`: serve the production build locally
- `npm test`: run the unit tests once
- `npm run lint`: run ESLint
- `npm run typecheck`: run the TypeScript type-check

## Analytics

PostHog is optional. Copy `.env.example` to `.env.local` and set `VITE_POSTHOG_KEY` (and `VITE_POSTHOG_HOST` if not using the EU cloud; update the CSP in `public/_headers` to match). With an empty key the app makes no analytics calls.
