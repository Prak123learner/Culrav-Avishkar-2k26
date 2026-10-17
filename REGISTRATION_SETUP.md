# Culrav Avishkar registration portal

## What is implemented

- `/login`: participant Google sign-in using Firebase Authentication.
- `/portal`: participant profile, CA ID, team invitations and registered events.
- `/register/:festival/:category/:title`: a published subevent's native registration form. Old `/portal/events/:id` links redirect here.
- `/coordinator/login`: separate staff email/password login.
- `/coordinator`: mandatory first-login password change, category-scoped form and participation settings, deadlines, public coordinator contacts, responses and exports. About and rules are read-only.
- `/admin` (login at `/admin/login`): administration, including categories, coordinator accounts, event status, opening dates and branch eligibility. Admin accounts visiting `/coordinator` are redirected here. Admins and assigned coordinators can set answer editing in the event form's publish section.

Both staff workspaces include **CA ID lookup**. A full CA ID or trailing digits find a participant's basic profile. Admins see that participant's registrations across all events; coordinators see only registrations in their assigned categories.

The admin **Logs** tab lists recorded fest audits for category changes, coordinator access changes and event/form updates. Historical registration-review audit entries may remain from before approvals were removed. Filter by action, staff name/email/CA ID, record ID or date range; results are paginated at 50 per page. This endpoint is admin-only and excludes credentials and form response contents. It displays existing recorded actions and targets; it is not a full before/after history or a record of uninstrumented legacy actions.

Participant and staff sessions use separate HttpOnly cookies lasting eight hours. Admins and coordinators share the staff cookie, with their current role and access checked in MongoDB. Each login has a server-side session record; logout deletes that record, so a copied cookie no longer works. Sessions restore after refresh; the frontend revalidates on tab focus and clears the affected session on API 401 responses. Logout is shared across open same-origin tabs without affecting the other session type. Password changes, staff revocation and category reassignment invalidate older staff sessions. These are fixed-duration sessions, without automatic sliding renewal. Cookies issued before the server-side-session change require a fresh login. Focused isolated checks are documented in `TESTING.md`.

Staff Events navigation starts with Avishkar and Culrav, then categories, then subevents. Search returns matching categories and events from the signed-in staff member's permitted categories. The standalone `/portal/events` directory and navbar REGISTER link have been removed; registration starts from each festival event's Register Now button.

Inside a category, **View category responses** shows registrations across all its events. Coordinators can view only assigned categories; admins can view all categories. Submissions are recorded immediately without an approval step. Filter by event to download that event's Excel/CSV responses. The combined category view is paginated at 50 registrations per page.

The 116 fixed subevents across 20 categories use two deliberately separate catalogs. Public descriptions, rules and coordinator contacts live in `client/src/data/event-catalog/<festival>/<category>/subevents.json` and are bundled with their category page, so opening Explore does not query MongoDB or briefly show stale content. Registration identity and initial participation sizes live in `server/portal/registration-catalog.json`; MongoDB stores only dynamic registration settings, forms, deadlines and responses. Neither admin nor coordinator can add/delete subevents or edit public editorial content through the portal. Change the relevant frontend JSON and redeploy when editorial content must change. Bootstrap uses insert-only seeding so existing forms and dynamic settings are retained.

Legacy User/Team/Event collections and external Google Forms are not overwritten. The old API and dashboard routes are retired and return 404; new identities, categories, teams and registrations use `Fest*` models. Any production migration of existing participant accounts needs a deliberate migration.

## 1. Firebase setup — follow in this order

This project uses **Firebase Authentication for Google login only**. Participant profiles, CA IDs, teams, events and registrations stay in your local MongoDB. You do not need to create Firestore, Realtime Database, Firebase Storage or Firebase Hosting for this setup.

On the original development machine, the supplied Web app settings are in ignored `client/.env`, and the backend's `FIREBASE_PROJECT_ID` is `culrav-avishkar`. These files are not in Git. A fresh clone must create its own `client/.env` and `server/.env` using the values below, enable Google in the Firebase console, authorize localhost and provide backend Admin credentials.

### A. Open the correct Firebase project

1. Open [Firebase Console](https://console.firebase.google.com/).
2. Sign in with a Google account that has access to this project's settings.
3. Select the project whose **Project ID is `culrav-avishkar`**.
4. Click the gear icon beside Project overview → **Project settings**.
5. Under **General**, confirm the Project ID. Both frontend and backend must use this same project.

You already registered a Web app, so there is no need to create a second app or paste the SDK snippet into a component. The application already initializes the Firebase SDK when you click Google sign-in.

### B. Enable the Google sign-in provider

1. In the project sidebar, open **Authentication** (under Build or Security, depending on the console layout).
2. Click **Get started** if Authentication has not been initialized.
3. Open **Sign-in method**.
4. Select **Google**, or click **Add new provider → Google**.
5. Turn **Enable** on.
6. If prompted, provide a public-facing project name such as `Culrav Avishkar` and select a project support email you control.
7. Click **Save**.

You do not need to enable Firebase Email/Password for coordinators. Coordinator passwords are handled by this project's backend, not Firebase.

### C. Authorize the local website

1. Still under Authentication, open **Settings → Authorized domains**.
2. Click **Add domain**.
3. Enter just `localhost` and save.
4. Keep the existing Firebase-provided domains.
5. When deploying later, add your real frontend hostname here as well.

For a Vercel deployment, use Firebase's standard popup sign-in. Set `VITE_FIREBASE_AUTH_DOMAIN=culrav-avishkar.firebaseapp.com` in the frontend Vercel environment and add the frontend hostname under Firebase Authentication's **Authorized domains**. Redeploy after changing the environment. The popup uses Firebase's existing `https://culrav-avishkar.firebaseapp.com/__/auth/handler` callback; the frontend no longer proxies Firebase's auth helper or uses its own hostname as `authDomain`. Keep the existing Firebase callback configured. See [Firebase Google popup sign-in](https://firebase.google.com/docs/auth/web/google-signin).

Enter `localhost`, **not** `http://localhost:5173` and not a URL path. Recent Firebase projects may not authorize localhost automatically. Use `http://localhost:5173` consistently in your browser during local testing; do not switch between localhost and 127.0.0.1 for the cookie-based app session.

### D. Understand the frontend configuration

The four values used by the code are in:

`client/.env` in your checkout

```dotenv
VITE_API_BASE_URL=http://localhost:3000/api/v1
VITE_FIREBASE_API_KEY=<apiKey from your Firebase Web app>
VITE_FIREBASE_AUTH_DOMAIN=culrav-avishkar.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=culrav-avishkar
VITE_FIREBASE_APP_ID=1:256929305931:web:57b35f52e2b7fe1d5784ce
```

The actual API key is saved only in the original ignored local file; copy it from the Firebase console on a fresh checkout. The placeholder above is only for this guide.

To find these values again: **Project settings → General → Your apps → select the Web app → SDK setup and configuration → Config**.

| Firebase Web config field | This project's environment variable |
| ------------------------- | ----------------------------------- |
| `apiKey`                  | `VITE_FIREBASE_API_KEY`             |
| `authDomain`              | `VITE_FIREBASE_AUTH_DOMAIN`         |
| `projectId`               | `VITE_FIREBASE_PROJECT_ID`          |
| `appId`                   | `VITE_FIREBASE_APP_ID`              |

Copy values only, not the entire JavaScript `firebaseConfig` object. The supplied `storageBucket`, `messagingSenderId` and `measurementId` are not needed by this Google-login implementation.

`VITE_FIREBASE_AUTH_DOMAIN` is used in both development and production. For this project, keep it set to `culrav-avishkar.firebaseapp.com`, including on Vercel.

If Edge reports a blocked popup, click the blocked-popup icon in its address bar, allow popups for this frontend site, and click **Continue with Google** again. The app does not automatically switch to redirect login. The SDK is imported and initialized before the click, and the click handler starts popup sign-in before awaiting any network request. A browser policy or explicit site block still requires the user to allow the popup.

The login page now waits for Firebase's initial auth state to settle and preconnects to its sign-in origins before enabling the button (with a five-second readiness fallback). These hints reduce connection setup work; they do not preload Firebase's internal popup helper or override browser policy. A first blocked attempt asks the participant to click again, while repeated blocking explains the browser permission. Verify the first-click behavior in Edge on the deployed build using `TESTING.md`.

**Visibility:** anything prefixed `VITE_` is compiled into the browser application. Firebase's Web config and Web API key are public project identifiers, not Admin credentials. An `.env` file keeps configuration out of Git but cannot hide a value that frontend JavaScript must use. The backend independently verifies identity before granting a festival session.

### E. Download backend Firebase Admin credentials

The Web API key from step D is **not sufficient** for this backend's Firebase Admin verification and revocation checks.

1. In the Firebase console, click the gear → **Project settings**.
2. Open **Service accounts**.
3. Select **Firebase Admin SDK**.
4. Click **Generate new private key**.
5. Confirm **Generate key**. A JSON file downloads.
6. Store the JSON in the project's ignored local directory as:

   `D:/coding/culrav avishkar 26/.local/firebase-admin.json`

7. Do not put this JSON under `client`, `public`, a frontend environment variable, or a shared document. Do not paste it into this chat. If your organization disables key creation, ask your project owner to arrange an approved backend credential method.

The JSON contains fields including `project_id`, `client_email` and `private_key`. Confirm its project is `culrav-avishkar`.

### F. Put Firebase Admin credentials in the backend environment

Open `server/.env`. Keep the existing MongoDB URI, JWT secret, admin email and other settings. Copy these three values from the service-account JSON into backend-only environment variables:

```dotenv
FIREBASE_PROJECT_ID=culrav-avishkar
FIREBASE_CLIENT_EMAIL="<client_email from the service-account JSON>"
FIREBASE_PRIVATE_KEY="<private_key from the service-account JSON, with newlines written as \n>"
```

Remove `GOOGLE_APPLICATION_CREDENTIALS` from `server/.env`. When the email and private key are set, the backend initializes Firebase Admin directly from these variables and does not read the JSON file at runtime. Keep `server/.env` private and uncommitted. The JSON in `.local/` remains ignored and is not required after the values are set.

For deployment, set the same backend-only variables in your hosting environment. A local `D:/...` JSON path will not exist there.

| Setting                                               | Browser-visible? | Purpose                                                 |
| ----------------------------------------------------- | ---------------- | ------------------------------------------------------- |
| Firebase Web API key, auth domain, project ID, app ID | Yes              | Connect browser Google sign-in to your Firebase project |
| Service-account JSON / private key                    | No               | Backend Firebase Admin credentials                      |
| JWT signing secret                                    | No               | Sign this website's own session cookies                 |
| MongoDB URI and SMTP password                         | No               | Backend database and mail access                        |

### G. Restart frontend and backend

Environment changes do not update a running plain Node backend.

In the terminal currently running the backend, press **Ctrl+C**, then:

```powershell
Set-Location 'D:\\coding\\culrav avishkar 26\\server'
npm start
```

In the terminal running Vite, press **Ctrl+C**, then:

```powershell
Set-Location 'D:\\coding\\culrav avishkar 26\\client'
npm run dev -- --port 5173 --strictPort
```

If the terminal says the port is in use, stop that existing project process first; do not accidentally start a second copy on a different port without updating `FRONTEND_URL`.

### H. Manually confirm Google login

For a live Firebase check, when you are ready:

1. Open `http://localhost:5173/login`.
2. Click **Continue with Google** and choose a test participant account.
3. Complete Google's popup.
4. Expected: your participant dashboard opens and shows a CA ID.
5. Complete the profile.
6. Sign out and use the same Google account again. Expected: the same CA ID returns.
7. In Firebase Console → Authentication → Users, confirm the Google account appears.
8. Your fest profile belongs in MongoDB, not Firestore.

The browser sends a Firebase ID token to `POST /api/v1/portal/auth/google`. Firebase Admin checks it on the backend, which creates/reuses the participant and sets an HttpOnly application session cookie. Coordinator login remains at `/coordinator/login`.

### Troubleshooting

| Symptom                                                  | What to check                                                                                                                                                                    |
| -------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Google login button is disabled / awaiting configuration | All four `VITE_FIREBASE_*` values must be nonempty in `client/.env`; restart Vite.                                                                                               |
| `auth/operation-not-allowed`                             | Enable Google in Authentication → Sign-in method.                                                                                                                                |
| `auth/unauthorized-domain`                               | Add `localhost` under Authentication → Settings → Authorized domains.                                                                                                            |
| Popup blocked or closed                                  | Allow popups for localhost and click the button again.                                                                                                                           |
| `auth/invalid-api-key`                                   | Copy the Web app's `apiKey` exactly; do not use a service-account private key here.                                                                                              |
| Backend says Firebase is not configured                  | Set `FIREBASE_PROJECT_ID` in `server/.env` and restart the backend.                                                                                                              |
| Google popup succeeds but backend rejects login          | Confirm both projects match; check the service-account file path, credential validity and backend console. The backend intentionally returns a generic token-verification error. |
| Error loading default credentials / file not found       | Use the exact quoted absolute JSON path in `GOOGLE_APPLICATION_CREDENTIALS`; ensure the file exists and the backend process can read it.                                         |
| Invalid PEM/private-key format                           | Prefer the JSON-file method, or preserve the complete PEM value and its newline escapes.                                                                                         |
| Backend unavailable / network error                      | Start MongoDB and `npm start` in `server`; confirm the client API URL uses port 3000.                                                                                            |
| Request origin is not allowed                            | Open the frontend at `http://localhost:5173`; `FRONTEND_URL` must match that exact origin.                                                                                       |
| External-college Google account is denied                | Check any Google OAuth audience/organization restrictions and ask the Firebase/Workspace project administrator to permit the intended participants.                              |

Official references: [Google sign-in](https://firebase.google.com/docs/auth/web/google-signin), [Web app setup/configuration](https://firebase.google.com/docs/web/setup), [Authorized localhost domains](https://firebase.google.com/docs/auth/faq-and-troubleshooting), [Admin credentials](https://firebase.google.com/docs/admin/setup), [Firebase Web API key visibility](https://firebase.google.com/docs/projects/api-keys).

## 2. Configure MongoDB and server

Create `server/.env` (it is ignored by Git). Start with these settings, then add the Firebase Admin values from step 1:

```dotenv
NODE_ENV=development
PORT=3000
MONGO=mongodb://127.0.0.1:27017/culrav_avishkar?replicaSet=rs0
JWT_SECRET=<generate-a-random-secret-of-at-least-32-characters>
FRONTEND_URL=http://localhost:5173
ADMIN_EMAIL=culrav@mnnit.ac.in
```

The `.env.example` files are intentionally not committed. Set:

- `MONGO`: use a replica set or sharded MongoDB deployment. The existing local standalone service still supports catalog, login and editing, but registration submission and answer edits now return 503 until it is configured as a single-node replica set. Do not just append `replicaSet` to the URI: start `mongod` with a replica-set name, initialize it with `rs.initiate()`, then update the URI (for example, `mongodb://127.0.0.1:27017/culrav_avishkar?replicaSet=rs0`). Back up existing local data before changing the MongoDB service configuration. A managed Atlas replica set is also suitable. The event/member unique index remains as duplicate protection.
- `JWT_SECRET`: a strong randomly generated secret.
- `FRONTEND_URL`: allowed frontend origin, initially `http://localhost:5173`. Development may use comma-separated explicit origins. Production requires one exact HTTPS origin, matching the public website URL.
- `ADMIN_EMAIL`: initial admin's email, used by bootstrap.
- Firebase settings from step 1.
- Optional SMTP settings for emailing coordinator temporary credentials.

The old `DATABASE`/`DATABASE_PASSWORD` connection settings remain supported if `MONGO` is unset. The server waits for MongoDB and its main portal model indexes before listening. Check actual indexes with MongoDB's `getIndexes()` before launch; an index definition in code alone does not prove it exists or that a query uses it.

From `server`:

```powershell
npm install
npm run bootstrap
npm start
```

Bootstrap creates the initial administrator only if that email does not already exist. It displays the generated temporary password once in your terminal and seeds 20 categories and 116 fixed subevents from the registration-only catalog. Running it again does not reset credentials, overwrite forms/settings or delete records. Temporary admin credentials expire in 72 hours; sign in promptly and change the password. The original machine's ignored `.local/ADMIN_ACCESS.txt` is not in a fresh clone; a new database gets a new temporary password. Delete any local credentials note after changing the password. To transfer existing participants, forms and responses, restore a MongoDB backup separately; bootstrap does not copy them. When upgrading a database created by the older editable-content schema, run `npm run migrate:static-content` once from `server`; this safety-restricted command accepts only a local MongoDB URI, removes the duplicated editorial fields and locks participation settings for already-published/registered events.

For a deliberate local testing reset, stop the backend, back up the database, and run `npm run reset:test-data -- --confirm=RESET-FESTIVAL-DATA` from `server`. This backend-only CLI command is not exposed through an HTTP route or frontend bundle. It refuses `NODE_ENV=production`, refuses non-local MongoDB hosts, verifies `ADMIN_EMAIL` before deleting anything, preserves that admin account/password/CA ID, removes every other portal account/session/team/registration/audit record, releases deleted random CA ID suffixes, and recreates the fixed categories/events with empty unpublished forms. The retained admin is signed out and must log in again. Never add this command to application startup.

From `client`:

```powershell
npm install
npm run dev
```

Open `/coordinator/login` and use the bootstrap credentials. The backend blocks all management operations until the password is changed. New staff grants and explicit password resets generate fresh 72-hour temporary passwords. Assigning categories to an existing staff account retains their password and revokes existing sessions so new permissions are reloaded. Access revocation takes effect on the next request.

Without SMTP, the admin grant/reset response displays a temporary password once in the dashboard for secure manual delivery. With SMTP, delivery is attempted; a delivery failure is shown to the admin and does not silently lose the credentials. No password is stored in plaintext or included in subsequent list responses.

## 3. Set up an event

1. Admin creates/renames categories under Avishkar or Culrav.
2. Admin assigns a coordinator email to one or more categories.
3. Coordinator signs in, changes their temporary password and selects an existing subevent in their assigned categories. There are no create/delete/rename subevent controls or APIs.
4. Public About text, rules and coordinator contacts are changed in the category JSON files and deployed with the frontend. Admins and assigned coordinators manage participation type (Solo, Team, or Solo or team), team-size limits and the form. A coordinator can change participation settings until the form is first published; first publication permanently locks those controls for coordinators, even if the form is later unpublished. An admin can make a protected correction afterward, but cannot change mode once registrations exist or choose a size range that excludes an existing registration. Only admins can change event status, branch eligibility and opening time. Coordinators may set an optional deadline for new registrations; leaving it blank keeps registration open while the event and form remain published. The updated-response deadline remains separate and required when changed questions affect existing responses. Admins and assigned coordinators can set answer-edit permission. College eligibility is no longer a setting or a registration restriction, including for older saved events. Times use the browser's local timezone and are stored in UTC. Coordinators can publish registration forms directly without admin approval. Registration availability still follows the event status and any opening/closing dates. Older stored participation-confirmation flags no longer block registration.

5. Add text, paragraphs, numbers, dates, dropdowns, radio choices, checkbox groups and file/folder link questions. Mark required questions and add instructions. Reorder with Move up/down, then preview.
6. Publish the form. Participants start registration from each public event's Register Now button. Forms start unpublished, so incomplete forms do not accidentally accept registrations.

Subevents cannot be added or removed through the portal. Admin can close/archive/cancel them operationally. Form edits create new versions. When an already-used form gains, loses, or changes questions, a coordinator must set a future response-update deadline before publishing. Registered events then flags affected responses. Unchanged answers are prefilled; new or changed questions start blank, and earlier answers remain in response history. Changing only instructions does not require resubmission; changing Required requests review while preserving a previous answer. Question reordering alone does not require another submission. The original submitter (team leader for team entries) can submit and correct the updated form by that separate deadline even after registration closes. This replaces the current answer immediately; no staff approval is required. If the deadline passes, the original submission remains recorded with its older form answers. Optimistic revision checks prevent one editor overwriting another's work. Coordinator payloads containing title, category, event status, opening time or branch eligibility are rejected on the server. Admin payloads cannot change either deadline.

## 4. Participant/team flow

Participants sign in with Google and complete their profile before opening a registration form. College defaults to MNNIT Allahabad and can be changed for external participants. Course is B.Tech, MBA or MCA; the required Year dropdown offers 1–4, 1–2 or 1–3 respectively and resets when Course changes. Branch uses full names, with an Other option for custom text. Existing profiles missing Course or Year must complete them before registering. Saving opens a confirmation showing all details and requires an acknowledgement checkbox. Once saved, profile fields are greyed out and cannot be edited; the API also rejects later changes. Existing complete profiles are treated as already saved. CA ID and Google email remain fixed. Registration forms display saved details read-only and attach them automatically, including separate Course and Branch fields. New immutable CA IDs use a random, globally reserved six-digit suffix, e.g. `CA-2026-483217`; previously issued sequential IDs remain unchanged. A staff account and participant account are intentionally separate identities even when the email matches.

Newly saved participant phone numbers must have exactly 10 digits and start with 6, 7, 8 or 9. The form and API both reject other formats before the one-time profile save.

For solo events, the participant submits their own form. For team events, the leader creates a team and invites members by CA ID. Members must accept and complete their profiles before the leader submits. Each confirmed member is checked for eligibility and prior registration. A unique event/member database index prevents a person entering the same event under multiple teams. Membership and profiles are snapshotted at submission; changing the reusable team later does not change submitted registrations.

Ordinary answer edits are available only while the event is published, within its registration window and if an admin or assigned coordinator enabled editing. These edits retain the original form version and save immediately. A requested form update has its own deadline and can be submitted while the event is published or closed. It replaces the current response with the new form version and archives the previous questions and answers. Other team members can view the notice but cannot edit the leader's answers. Coordinators' access checks happen on the server for every operation. Previously stored approval decisions are ignored by the current workflow and hidden from participant/staff response views; the old audit trail remains historical data.

## 5. Files and reporting

No files are uploaded to this server, MongoDB or Firebase Storage. Participants upload to their own storage and submit HTTP(S) links. Validation checks URL syntax only; it cannot promise that a Drive file is accessible or unchanged. Coordinators can inspect links in responses, but there is no approval or correction-request status. Participants can change answers only while editing is enabled or a form-update window remains open; organizers should tell participants how to share accessible links before they submit.

Responses are paginated (50 per page). Excel and CSV exports are scoped to an event and include one row per registration, without approval-status columns. A solo row contains the participant; a team row contains the team name, leader's saved profile, member count, and form-version-specific answers. The coordinator response view still shows every team member's profile. CSV/Excel formula injection is neutralized. Google Sheets automatic synchronization is not included; Excel/CSV exports work without Google API credentials.

## Verification and launch boundary

```powershell
cd server
npm test
npm run test:standalone
cd ../client
npm run build
node node_modules/eslint/bin/eslint.js src/portal
```

Tests use temporary isolated MongoDB instances (standalone and replica set), never the configured development/production database. The standalone test checks rejection of non-atomic registration writes. First run downloads a MongoDB binary. Firebase verification is mocked only inside the test module; no test-login endpoint or production verification bypass exists. Real Firebase popup login, SMTP delivery and deployment infrastructure require their actual configuration and an end-to-end rehearsal. Use TESTING.md for manual verification and the latest isolated test results.

Before serving 10,000+ participants: serve the frontend from one HTTPS origin and route that origin's `/api/v1/*` to the backend. Production portal code calls relative `/api/v1/portal`; a separate backend hostname by itself will not work. If using two Vercel projects, configure a rewrite/proxy on the frontend project for `/api/v1/*`, pointing to the backend project, and set backend `FRONTEND_URL` to the frontend's exact HTTPS origin. Vercel supports Express directly without a special backend `vercel.json`; choose the `server` directory as the backend project root and verify which of its recognized `app.js`/`server.js` entries Vercel runs. In this project `app.js` exports Express while `server.js` initializes MongoDB, so the deployed entry must ensure MongoDB is connected before handling a request and reuse connections appropriately. Configure Firebase Authorized domains for the frontend hostname. `NODE_ENV=production` makes cookies `Secure`, and startup rejects an HTTP/ambiguous `FRONTEND_URL` or a short JWT secret when `server.js` is run. Verify that the frontend proxy forwards `Origin`, cookies and `Set-Cookie` correctly; test login, refresh, logout, form submission and exports on the deployed domain. Check Vercel's function size/duration limits for the Express bundle and Excel export. Choose `HOST` for a non-Vercel reverse-proxy/container topology. Verify backups, account recovery and peak-load behavior before launch. Participant counts alone do not prove capacity; measure registration contention near deadlines. Legacy API paths are retired, but legacy data remains stored.

The frontend dependency audit is clean after a patched gRPC override. Remaining server advisories are in nodemon's development-only file-watching dependency tree; production starts with `node server.js`. ExcelJS's UUID dependency and Nodemailer are updated. Current Firebase packages declare Node >=24.12 for some dependencies; this workspace's Node 22 completed build/tests, but use a compatible Node release for reproducible installs and deployment.

Nothing is pushed to GitHub or deployed by these setup steps.
