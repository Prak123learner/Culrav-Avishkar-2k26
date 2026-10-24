# Culrav–Avishkar backend

## Reset festival data

Back up the target MongoDB database before running this command. Run it from your own machine with `MONGO` pointing to the database you intend to reset; it works with local MongoDB or Atlas. Include the database name in the URI (for example, `/culrav_avishkar`):

```powershell
npm run reset:festival-data -- --database=culrav_avishkar --confirm=RESET-FESTIVAL-DATA
```

Run it from the `server` directory, replacing `culrav_avishkar` with the exact database name in `MONGO`. It preserves only the admin configured by `ADMIN_EMAIL`, including that admin's password and CA ID. It removes other portal accounts, teams, registrations, responses, sessions and audit records, then recreates the categories and events from the current `portal/registration-catalog.json` with empty unpublished forms. Update that JSON before running the reset when changing the event catalog.

The reset refuses to run without the exact confirmation argument, an explicit database name in `MONGO`, a matching `--database` argument, or a verified admin account. It is a backend CLI command, not an HTTP route or frontend feature. It does not run automatically during deployment. Stop the backend or put registration on hold while the reset is in progress so requests do not write into partially reset data.

After reseeding, the reset automatically creates missing declared indexes using the same setup as `npm run db:indexes`. You do not need to run that command separately after a successful reset. Existing indexes are retained. If index setup fails, the command exits with an error; the reset has already happened, so fix the reported issue and run `npm run db:indexes` rather than resetting again.

## One-time performance data migration

After deploying the indexed CA-ID lookup fields, run this once against an existing database:

```powershell
npm run migrate:performance-data
```

It preserves existing accounts, CA IDs, registrations and answers. It fills derived CA-ID suffix fields, reserves all issued suffixes, fills missing legacy team-leader CA IDs, and creates the declared indexes. Fresh databases and databases processed by `reset:festival-data` do not require a separate bootstrap for these fields.

## Start a fresh festival database

For a new festival year, keep the current MongoDB connection credentials in `MONGO` but choose a brand-new database name. The command creates that database on first write, creates `culrav@mnnit.ac.in` as the initial admin, prints a new temporary password once, and seeds the fixed categories and empty event forms.

```powershell
npm run initialize:fresh-festival -- --database=culrav_avishkar_2027 --confirm=CREATE-FRESH-FESTIVAL-DATABASE
```

The target database must be empty; the command refuses to overwrite any existing collections. After it finishes, update the deployed backend's `MONGO` value to use the same database name. The temporary password expires after 72 hours and must be changed at first coordinator login.

## Separate frontend and backend deployments

Use explicit HTTPS origins when the frontend and backend are separate Vercel projects:

```text
Frontend: https://www.example.edu
Backend:  https://api.example.edu
```

Set the frontend project's build-time `VITE_API_BASE_URL` to `https://api.example.edu/api/v1`. Set the backend project's `FRONTEND_URL` to `https://www.example.edu`; this is the exact origin allowed by credentialed CORS and by the portal write-origin check. Set `BACKEND_URL` to the backend's public origin for deployment documentation.

The `www` and `api` subdomains share the same site, so keep `COOKIE_SAME_SITE=lax`. A custom frontend domain calling a raw `*.vercel.app` backend is cross-site. It requires `COOKIE_SAME_SITE=none` and HTTPS, but third-party-cookie restrictions can still break login in some browsers. Assigning `api.example.edu` to the backend Vercel project is the reliable configuration.

## Vercel backend deployment

Import the repository in Vercel with `server` as the Root Directory. The included `vercel.json` deploys `app.js` as the Express Function; do not deploy `server.js`, because it calls `app.listen()` for local development only. Set every production environment variable from `.env.example` in the Vercel project before deploying. The Express app opens and reuses a MongoDB connection for warm function instances.

Set `MONGO_MAX_POOL_SIZE=10` for Vercel. Each Vercel function instance has its own MongoDB pool, so this cap protects Atlas from a burst of cold instances opening Mongoose's larger default pools.

## Health check

Test server and database connectivity at any time:

```text
GET /health
GET /api/v1/health
```

Returns `200 OK` when both the Express server and MongoDB are fully connected:

```json
{
  "status": "ok",
  "uptime": 42,
  "timestamp": "2026-10-18T01:45:00.000Z",
  "database": "connected"
}
```

If the database is unreachable or misconfigured, it returns `503 Service Unavailable` with details in the `database` property instead of crashing the serverless instance.
