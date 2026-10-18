# Culrav–Avishkar deployment and failover runbook

Use this document for the production deployment and for moving either project
between Vercel accounts during the fest.

## Target architecture

```text
GoDaddy                 Cloudflare                 Vercel
--------                ----------                 ------
Domain registration ──> DNS + protection ──> harsh1: frontend
                                              culrav-avishkar.com

                                         ──> harsh2: backend
                                              api.culrav-avishkar.com

                                         ──> harsh3: standby backend
                                              temporary vercel.app URL
```

Keep the domain registered at GoDaddy. Cloudflare becomes the authoritative DNS
manager. Vercel hosts the two applications.

Use the same stable hostnames regardless of the Vercel account currently
serving them:

```text
Frontend: https://culrav-avishkar.com
Backend:  https://api.culrav-avishkar.com
```

This is important: the browser session cookie belongs to
`api.culrav-avishkar.com`. Moving that hostname to another Vercel account keeps
participants signed in, provided the new backend uses the same MongoDB database
and `JWT_SECRET`.

## Record this information before deployment

Fill this in privately. Do not put passwords, MongoDB credentials, JWT secrets,
or Firebase private keys in this file.

| Item | Value |
| --- | --- |
| Registrar account | GoDaddy |
| Cloudflare zone | `culrav-avishkar.com` |
| Frontend Vercel account/project | `harsh1` / __________________ |
| Primary backend Vercel account/project | `harsh2` / __________________ |
| Standby backend Vercel account/project | `harsh3` / __________________ |
| MongoDB database | `culrav_avishkar` |
| Primary backend temporary URL | __________________ |
| Standby backend temporary URL | __________________ |
| Current `api` CNAME target | __________________ |

## Part 1 — Move DNS management from GoDaddy to Cloudflare

Do this once, well before the fest. It is not part of normal Vercel failover.

1. Create a Cloudflare account and choose **Add a site**.
2. Enter `culrav-avishkar.com` and choose the Free plan.
3. Review every DNS record Cloudflare imports from GoDaddy.
4. Manually add any missing MX, TXT, CNAME, or verification records. This is
   essential if the domain uses email or another external service.
5. Cloudflare will display two assigned nameservers, for example:

   ```text
   alice.ns.cloudflare.com
   brad.ns.cloudflare.com
   ```

   Use the exact pair Cloudflare shows; these names are unique to the zone.
6. In GoDaddy, open the domain's **Nameservers** settings and replace the
   existing nameservers with Cloudflare's two nameservers.
7. Wait until Cloudflare marks the zone **Active**. This can take minutes and
   may take up to 24 hours.
8. From this point onward, make DNS changes in **Cloudflare**, not GoDaddy.

Do not change nameservers again when moving a frontend or backend Vercel
project. The Cloudflare nameservers stay in place permanently.

## Optional — private test/staging site

Use separate staging hostnames while the site is being tested:

```text
Test frontend: https://test.culrav-avishkar.com
Test backend:  https://api-test.culrav-avishkar.com
```

Do not point a test frontend at the production API if test registrations,
profiles, or coordinators will be created. A proper staging setup uses a
separate MongoDB database, for example `culrav_avishkar_staging`.

### Deploy the test frontend

1. Create a second Vercel frontend project or use a separate preview/staging
   branch. Its Root Directory is `client`.
2. Set its environment variables:

   ```env
   VITE_API_BASE_URL=https://api-test.culrav-avishkar.com/api/v1
   VITE_FIREBASE_API_KEY=...
   VITE_FIREBASE_AUTH_DOMAIN=...
   VITE_FIREBASE_PROJECT_ID=...
   VITE_FIREBASE_APP_ID=...
   ```

3. Add `test.culrav-avishkar.com` in that Vercel project's **Settings →
   Domains** section.
4. Add Vercel's requested DNS record in Cloudflare:

   ```text
   Type: CNAME
   Name: test
   Target: <the exact target Vercel shows>
   Proxy status: Proxied (orange cloud)
   ```

5. In Firebase Authentication → Settings → Authorized domains, add:

   ```text
   test.culrav-avishkar.com
   ```

### Deploy the test backend

1. Create a separate Vercel backend project with Root Directory `server`.
2. Use the staging database and a separate staging JWT secret:

   ```env
   NODE_ENV=production
   MONGO=.../culrav_avishkar_staging?retryWrites=true&w=majority
   JWT_SECRET=a-separate-long-staging-secret
   FRONTEND_URL=https://test.culrav-avishkar.com
   BACKEND_URL=https://api-test.culrav-avishkar.com
   COOKIE_SAME_SITE=lax
   MONGO_MAX_POOL_SIZE=10
   FIREBASE_PROJECT_ID=...
   FIREBASE_CLIENT_EMAIL=...
   FIREBASE_PRIVATE_KEY=...
   ```

3. Add `api-test.culrav-avishkar.com` to the test backend Vercel project.
4. In Cloudflare DNS, add the exact CNAME target Vercel provides:

   ```text
   Type: CNAME
   Name: api-test
   Target: <the exact target Vercel shows>
   Proxy status: DNS only
   TTL: 60 seconds
   ```

5. Test `https://api-test.culrav-avishkar.com/health`.

### Restrict the test frontend with Cloudflare Access

A subdomain is still public if someone knows its URL. Cloudflare Access puts a
login gate in front of `test.culrav-avishkar.com`.

1. In Cloudflare, open **Zero Trust → Access controls → Applications**.
2. Select **Create new application → Self-hosted and private**.
3. Add public hostname:

   ```text
   test.culrav-avishkar.com
   ```

4. Create an **Allow** policy that includes only the specific tester email
   addresses, or an approved MNNIT email domain.
5. Choose an identity provider such as Google or One-time PIN email.
6. Save the application and test in a private/incognito browser window.

Cloudflare Access protects traffic through the custom test hostname. A person
who knows the underlying `*.vercel.app` deployment URL could still open that
URL directly unless Vercel Deployment Protection is enabled for that project.
Do not share the Vercel deployment URL; enable Vercel's own deployment
protection as well if the account plan provides it.

## Part 2 — Deploy the frontend on `harsh1`

1. Import this repository into Vercel account `harsh1`.
2. Set the Vercel project Root Directory to `client`.
3. Add all frontend production environment variables. At minimum:

   ```env
   VITE_API_BASE_URL=https://api.culrav-avishkar.com/api/v1
   VITE_FIREBASE_API_KEY=...
   VITE_FIREBASE_AUTH_DOMAIN=...
   VITE_FIREBASE_PROJECT_ID=...
   VITE_FIREBASE_APP_ID=...
   ```

4. Deploy and test the temporary `*.vercel.app` URL.
5. In the frontend Vercel project, open **Settings → Domains** and add:

   ```text
   culrav-avishkar.com
   ```

6. Vercel shows the exact DNS record required for this project. In Cloudflare
   DNS, create the record Vercel requests. For an apex domain it is usually:

   ```text
   Type: A
   Name: @
   Target: 76.76.21.21
   Proxy status: DNS only initially
   ```

   Always prefer the exact target shown in Vercel over an example in this
   document.
7. Wait until Vercel marks the domain as valid and its SSL certificate is ready.
8. Test `https://culrav-avishkar.com`.

After it works, Cloudflare proxying (orange cloud) may be enabled for the
frontend if desired. Keep Cloudflare SSL/TLS mode set to **Full (strict)**. Do
not create a Cache Everything rule for HTML pages; Vercel deployments need HTML
to update immediately. Cloudflare will cache versioned JavaScript, CSS, images,
and fonts normally.

## Part 3 — Deploy the primary backend on `harsh2`

1. Import the same repository into Vercel account `harsh2`.
2. Set the Vercel project Root Directory to `server`.
3. Copy every backend secret and configuration value from the private server
   environment file. The backend on `harsh2` and standby on `harsh3` must use
   the same values for these items:

   ```env
   NODE_ENV=production
   MONGO=.../culrav_avishkar?retryWrites=true&w=majority
   JWT_SECRET=the-same-long-secret-on-every-backend
   FRONTEND_URL=https://culrav-avishkar.com
   BACKEND_URL=https://api.culrav-avishkar.com
   COOKIE_SAME_SITE=lax
   MONGO_MAX_POOL_SIZE=10
   FIREBASE_PROJECT_ID=...
   FIREBASE_CLIENT_EMAIL=...
   FIREBASE_PRIVATE_KEY=...
   ```

4. Deploy and test the temporary backend URL:

   ```text
   https://<backend-project>.vercel.app/health
   ```

   It must return a `200` response with `database: "connected"`.
5. In the backend Vercel project, open **Settings → Domains** and add:

   ```text
   api.culrav-avishkar.com
   ```

6. Vercel provides a unique CNAME target. In Cloudflare DNS create:

   ```text
   Type: CNAME
   Name: api
   Target: <the exact target Vercel shows>
   Proxy status: DNS only
   TTL: 60 seconds
   ```

   Keep `api` as **DNS only**. The API carries authentication cookies and
   dynamic registrations; it must not be cached by a CDN rule.
7. Wait for Vercel domain validation and SSL issuance.
8. Test:

   ```text
   https://api.culrav-avishkar.com/health
   ```
9. Test from the real frontend:

   - participant Google sign-in;
   - admin/coordinator sign-in;
   - page refresh while signed in;
   - sign out;
   - a participant registration.

## Part 4 — Prepare `harsh3` as the standby backend

Do this before the fest, not during an outage.

1. Deploy the backend repository in Vercel account `harsh3` with Root Directory
   `server`.
2. Copy the exact same backend environment values from `harsh2`.
3. Do **not** attach `api.culrav-avishkar.com` yet. Vercel allows a hostname to
   belong to only one project at a time.
4. Save and test its temporary Vercel URL:

   ```text
   https://<standby-backend>.vercel.app/health
   ```
5. Before the fest, make one test database read through the standby URL. Do not
   reset or seed the production database from this account.

## Part 5 — Move the backend from `harsh2` to `harsh3`

Use this when the primary backend Vercel account reaches a limit or needs to be
replaced.

1. Confirm the standby health endpoint returns `200`:

   ```text
   https://<standby-backend>.vercel.app/health
   ```

2. Confirm `harsh3` has the same MongoDB database and the same `JWT_SECRET` as
   `harsh2`. Do not continue if either differs.
3. In `harsh2` backend project → **Settings → Domains**, remove:

   ```text
   api.culrav-avishkar.com
   ```

4. In `harsh3` backend project → **Settings → Domains**, add:

   ```text
   api.culrav-avishkar.com
   ```

5. If Vercel asks to prove ownership, it displays a TXT record. Add that exact
   TXT record in Cloudflare DNS, wait for Vercel to verify it, then continue.
6. Vercel shows the CNAME target for `harsh3`. In Cloudflare, edit only the
   existing `api` CNAME record:

   ```text
   api  CNAME  <new target from harsh3>
   ```

7. Wait for Vercel to show the domain as valid and test:

   ```text
   https://api.culrav-avishkar.com/health
   ```

8. Test participant and staff login from `https://culrav-avishkar.com`.

No frontend environment-variable change or frontend redeployment is required.
The public API hostname remains the same. Existing sessions continue working
because the cookie hostname, database session records, and JWT secret remain the
same.

Expected recovery time when `harsh3` is already prepared: approximately 10–20
minutes, depending on Vercel verification and DNS caches.

## Part 6 — Move the frontend to another Vercel account

The backend remains unchanged.

1. Deploy the frontend in the replacement Vercel account with Root Directory
   `client`.
2. Copy the same `VITE_*` values, especially:

   ```env
   VITE_API_BASE_URL=https://api.culrav-avishkar.com/api/v1
   ```

3. Test the new temporary Vercel URL.
4. In the old frontend project, remove `culrav-avishkar.com`.
5. In the replacement frontend project, add `culrav-avishkar.com`.
6. Add any requested TXT ownership-verification record in Cloudflare.
7. Update the `@` DNS record in Cloudflare to the exact A or CNAME target Vercel
   gives for the replacement project.
8. Wait for SSL validation and test the homepage, login, registration, and API
   calls.

## Emergency fallback: raw Vercel backend URL

Avoid this unless the custom API domain cannot be moved. Pointing the frontend
at another `*.vercel.app` backend requires a frontend rebuild and makes cookies
cross-site.

If unavoidable:

1. Set the replacement backend `COOKIE_SAME_SITE=none`.
2. Set frontend `VITE_API_BASE_URL` to the replacement Vercel URL plus
   `/api/v1`.
3. Redeploy the frontend.
4. Expect every existing user to sign in again because cookies cannot move from
   one Vercel hostname to another.
5. Restore `VITE_API_BASE_URL=https://api.culrav-avishkar.com/api/v1` and
   `COOKIE_SAME_SITE=lax` once the custom API hostname is working again.

## Do not do these things

- Do not put secrets in Git, this runbook, or a frontend `VITE_*` variable.
- Do not change GoDaddy/Cloudflare nameservers during a frontend/backend
  failover.
- Do not change the MongoDB database or `JWT_SECRET` while moving a backend.
- Do not point the frontend at a raw backend Vercel URL for normal production
  use.
- Do not proxy or cache `api.culrav-avishkar.com` through a Cache Everything
  rule.
- Do not delete the old Vercel project until the replacement hostname and health
  checks are confirmed.

## Official references

- [Cloudflare: move DNS nameservers](https://developers.cloudflare.com/dns/nameservers/update-nameservers/)
- [Cloudflare: DNS setup](https://developers.cloudflare.com/dns/get-started/)
- [Vercel: set up a custom domain](https://vercel.com/docs/domains/set-up-custom-domain)
- [Vercel: add/configure project domains](https://vercel.com/docs/domains/working-with-domains/add-a-domain)
- [Vercel: domain troubleshooting](https://vercel.com/docs/domains/troubleshooting)
