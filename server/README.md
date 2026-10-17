# Culrav–Avishkar backend

## Reset local festival test data

Stop the backend and back up the local MongoDB database before running this command:

```powershell
npm run reset:test-data -- --confirm=RESET-FESTIVAL-DATA
```

Run it from the `server` directory. It preserves only the admin configured by `ADMIN_EMAIL`, including that admin's password and CA ID. It removes other portal accounts, teams, registrations, responses, sessions and audit records, then recreates the 20 categories and 116 events with empty unpublished forms.

The reset script refuses to run when `NODE_ENV=production`, when MongoDB is not local, when the configured admin cannot be verified, or when the exact confirmation argument is missing. It is a backend CLI command and is not exposed through the frontend or an HTTP route.

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
