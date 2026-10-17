# Pre-deployment code audit — 15 October 2026

This is a **review list, not a claim that the site is secure or ready for 10,000 concurrent users**. The status column tracks fixes applied after the original review. Isolated automated checks do not replace deployment verification, live-index inspection, or a load test.

Priorities: **P0** = block public deployment; **P1** = fix before registration opens; **P2** = fix or accept explicitly before launch. “Confirmed” means the code shows the behavior. “Deployment-dependent” means the impact depends on hosting/configuration. Findings refer to this checkout and may need rechecking after changes.

| ID  | Priority | Area                  | Finding                                                                                                                                      | Status |
| --- | -------- | --------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| A01 | P0       | Legacy API            | Old login/signup and event/team routes are still publicly mounted; some old event routes disclose participation data without authentication. | Fixed in code; retired URLs tested 404. |
| A02 | P1       | Sessions              | Logging out only clears the browser cookie; a copied portal JWT remains valid until expiry.                                                  | Fixed in code; copied-cookie replay tested 401. |
| A03 | P1       | Eligibility           | Branch is participant-entered and can drive event eligibility; other required profile details are also self-declared.                       | Repeat edits blocked after first profile save; self-declared eligibility remains open. |
| A04 | P1       | Abuse controls        | Staff login can be made to do unlimited bcrypt work by rotating email addresses; team and registration APIs have no broad abuse budget.      | Open |
| A05 | P1       | Database              | Registration and team read patterns lack supporting indexes; event response sort/export can degrade as responses grow.                       | Indexes and stable sort added; production `explain`/load test pending. |
| A06 | P1       | Consistency           | On standalone MongoDB, registration validation and insert are not atomic with event closure or team changes.                                 | Fixed in code by requiring transactions; local replica-set setup pending. |
| A07 | P1       | Deployment            | Cookie/origin/host settings require an explicit production topology; common split-site hosting can make login fail.                          | Same-origin topology enforced/documented in code; live deployment verification pending. |
| A08 | P1       | Admin bootstrap       | Initial admin temporary password is printed in process output; an ignored local plaintext copy currently exists.                             | Open |
| A09 | P2       | Forms                 | Unpublished form questions are available from the public event-detail API.                                                                   | Fixed in code; draft, publish and unpublish API test passed. |
| A10 | P2       | Forms / storage       | Every form revision is embedded in its event document without a retention/size limit.                                                        | Open |
| A11 | P2       | Audits                | Audit writes happen after the state change and cover only selected staff actions.                                                            | Open |
| A12 | P2       | Review flow           | Participant answer edits can reset an accepted/rejected registration to submitted.                                                           | Resolved by retiring submission approvals; historical decisions are hidden in current views. |
| A13 | P2       | Logic                 | “Solo or team” can be configured with minimum team size above one, making solo registration impossible.                                      | Fixed in code; mixed minimum is one and direct API validation is tested. |
| A14 | P2       | Frontend              | Fast filter changes can display a stale response list; failed logout keeps the current UI session visible.                                   | Open |
| A15 | P2       | Build/security upkeep | Both package lockfiles are ignored, so installs are not reproducible and dependency review cannot be tied to one release tree.               | Open |
| A16 | P2       | Capacity              | Rate limits and pagination are process-local/unbounded in places; no measured 10,000-user capacity exists.                                   | Open |
| A17 | P2       | Submitted links       | “File/folder URL” accepts any HTTP(S) destination and does not check Drive access or persistence.                                            | Default access reminder added to link questions; link access remains unchecked. |

## Findings and proposed fixes

### A01 — Retire or isolate the legacy API (P0, confirmed)

**Resolution (15 October):** The legacy auth/user/team/event routers and `/api/test` are no longer mounted. The old dashboard, email-confirmation and password-reset frontend routes are gone; the current portal and public festival pages remain. Focused HTTP tests confirm retired paths return 404 and the portal remains reachable. Legacy database collections and source files remain untouched.

Evidence: [server/app.js](server/app.js#L54) mounts the new portal and then the legacy `/api/v1/auth`, `/user`, `/team`, and `/event` routers. [server/Router/auth.router.js](server/Router/auth.router.js#L7) still permits independent password signup/login, despite the intended Firebase-only participant flow. [server/Router/event.router.js](server/Router/event.router.js#L6) has public event/team reads. In particular, [server/Controller/event.controller.js](server/Controller/event.controller.js#L69) returns a named user's participating events and team IDs without authentication; lines 30–49 populate team members from a caller-supplied ID (the GET route reads `req.body`, so browser behavior varies, but a direct HTTP client can supply it). The old and new collections are separate, so this does not directly grant a new portal session; it does leave an extra credential system and potentially exposes any legacy data still present.

Proposed fix: Decide whether old data/routes are still needed. If not, stop mounting the legacy routers and remove old frontend dashboard/auth routes. If migration is required, expose only a specifically reviewed migration path, then retire the old API. Verify all retired URLs return 404/410 and that current event pages and the new portal still work.

### A02 — Make logout revoke the server-side session (P1, confirmed)

**Resolution (15 October):** Each new participant/staff JWT has a random session ID backed by a TTL-indexed MongoDB record. Authentication requires the record; logout deletes only that session. Tests replay both kinds of copied cookie after logout and confirm a separate login remains valid. Pre-change JWTs lack a session ID and require sign-in again. Requests already authorized before logout may finish.

Evidence: [server/portal/auth.js](server/portal/auth.js#L7) signs 8-hour JWT cookies. [server/portal/router.js](server/portal/router.js#L117) and [server/portal/router.js](server/portal/router.js#L200) only clear the corresponding cookie on logout. `authenticate` checks `sessionVersion` for staff, but logout does not increment it; participants have no session version check. A copied token can therefore be replayed until its JWT expiry. Staff password changes and access changes do revoke older staff tokens, which is a useful existing control.

Proposed fix: Use revocable server-side session records (best if users need multiple devices) or a deliberate version-based revocation policy for both roles. Revoke on logout, password reset/change, role change, account disable, and incident response. Check concurrent tabs/devices and expiry. [OWASP session guidance](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html) calls for server-side invalidation.

### A03 — Do not treat self-entered profile fields as verified eligibility (P1, confirmed business-rule bypass)

Update (17 October): Participants now review and acknowledge their profile before the first save. The profile becomes read-only afterward, including for existing complete profiles; repeat API updates are rejected. This limits later divergence from registration snapshots. Google still verifies email identity, not a participant-entered college, roll number or branch. A user can claim an eligible branch on the initial save. College restrictions were removed after this audit; older saved college restrictions are no longer enforced.

Proposed fix: For branch-restricted events, decide how to verify the branch (for example, an institutional record or coordinator review) and distinguish `claimed` from `verified` fields. Define an administrator-mediated correction path for genuine mistakes in locked profiles, with an audit record. Test false branch claims before both solo and team registration.

### A04 — Add layered abuse and resource controls (P1, confirmed)

Evidence: [server/portal/router.js](server/portal/router.js#L31) keys the staff-login limiter by **IP plus submitted email**. An attacker can rotate arbitrary email values; every unknown account still invokes bcrypt comparison at lines 173–179. Portal team creation/invites/registration paths at lines 701–915 have no per-account quotas or broad write throttling. A participant can create unlimited teams and issue many invitations. The portal is mounted before the old global 100/hour API limiter in [server/app.js](server/app.js#L54), so that limiter does not cover it.

Proposed fix: Use layered IP, account/identity and global limits with a shared store across instances, plus a bounded team count and invitation budget. Reject/queue bursts before expensive bcrypt/Firebase/database work where possible. Set limits from realistic campus-NAT traffic so legitimate students are not blocked. Test repeated logins using rotating email addresses and high-volume team creation.

### A05 — Create indexes for actual response/team queries (P1, confirmed schema gap; impact needs `explain`)

**Resolution (15 October):** Added team member/pending-member indexes and registration member-history, event/time and category/time indexes. Registration lists and exports now sort by `createdAt` plus `_id`; index existence was checked in an isolated database. Confirm index builds and run `explain("executionStats")` with representative production-scale data before marking capacity verified. The old `{categoryId, createdAt}` index may remain in an existing database and should be reviewed for safe removal later.

Evidence: [server/portal/models.js](server/portal/models.js#L197) has a unique `{eventId, memberIds}` index and `{categoryId, createdAt}`. However [server/portal/router.js](server/portal/router.js#L706) queries teams by `memberIds`/`pendingIds`, lines 811–819 query a participant's registrations by `memberIds`, and lines 995–1009 and 1129–1132 query/sort/export by event and `createdAt`. The unique index starts with `eventId`; it cannot efficiently serve a query filtering only by `memberIds`, and it does not cover the per-event time sort. The fixed 116-event catalog is small; registrations and teams are the growth collections.

Proposed fix: Add indexes for team membership/invitations and for event response sort/export; evaluate a member-history index for registrations. Use `explain("executionStats")` on representative data to choose exact keys and avoid redundant indexes. Include stable `_id` tie-breakers for paging. [MongoDB compound index guidance](https://www.mongodb.com/docs/manual/core/indexes/index-types/index-compound/) explains prefix and sort behavior. Verify indexes are built in the deployed database, not only declared in Mongoose.

### A06 — Close standalone MongoDB registration races (P1, confirmed code path)

**Resolution (15 October):** Registration submissions/answer edits now require a replica set or sharded MongoDB transaction. A standalone deployment returns 503 before running the write, rather than accepting a non-atomic registration. The local MongoDB service must be configured as a single-node replica set (or replaced with a managed replica set) before those actions work again. Portal integration tests exercise the replica-set path; a focused standalone rejection test is provided.

Evidence: [server/portal/database.js](server/portal/database.js#L6) uses a transaction only for replica sets/sharded topology; local standalone MongoDB executes the work without one. [server/portal/router.js](server/portal/router.js#L827) reads open status/team membership, validates, then updates an event revision and creates a registration. That revision update does not condition on the status or revision read. A concurrent close/form change or team edit can interleave. The unique registration index still protects duplicate member registration, but not every stale-snapshot rule.

Proposed fix: Deploy a MongoDB replica set and keep the transaction path, then test concurrent close, team edit, and registration submissions. Also make the event write conditional on the validated state/revision so a stale read fails deterministically. Define retry behavior for transaction conflicts. Do not assume the current standalone service has transaction guarantees.

### A07 — Decide production origin, cookie, and binding configuration together (P1, deployment-dependent)

**Resolution in code (15 October):** Production portal requests use same-origin `/api/v1/portal`; startup rejects non-HTTPS or ambiguous `FRONTEND_URL` and weak/missing JWT secrets. Production deployment must serve the frontend and proxy `/api/v1` to the backend under the same HTTPS origin. Live proxy, Firebase authorized-domain, cookie and export checks remain pending because the public domain has not been chosen.

Evidence: [server/portal/auth.js](server/portal/auth.js#L7) sets `SameSite=Lax`, `Secure` only when `NODE_ENV=production`, and an 8-hour cookie. [server/portal/router.js](server/portal/router.js#L20) requires an exact configured `Origin` on writes; [server/app.js](server/app.js#L24) configures credentialed CORS. [server/server.js](server/server.js#L21) binds to `127.0.0.1` by default. [client/src/portal/api.js](client/src/portal/api.js#L2) falls back to a localhost API URL when the production Vite variable is missing. A frontend on one site and API on another may not send Lax cookies on XHR; some hosts also require listening on `0.0.0.0`.

Proposed fix: Select exact public frontend/API domains and use HTTPS. Prefer a same-site API origin/reverse proxy; if truly cross-site, explicitly design `SameSite=None; Secure` plus a CSRF defense and browser verification. Set `FRONTEND_URL`, `VITE_API_BASE_URL`, `NODE_ENV`, `HOST`, and trusted proxy settings for the chosen host. Add a deployment smoke test for login, refresh, logout, form submit, and admin writes from the real domain. The current exact Origin check is a useful CSRF control when configured correctly; do not remove it casually. [OWASP CSRF guidance](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html).

### A08 — Review temporary admin credential handling (P1, confirmed)

Evidence: [server/portal/bootstrap.js](server/portal/bootstrap.js#L27) creates a random first password, hashes it for MongoDB, then prints the plaintext to process output at lines 35–38. An ignored `.local/ADMIN_ACCESS.txt` in this workspace also contains the original temporary credential from setup. Coordinator temporary passwords are returned to the admin browser and optionally emailed ([server/portal/router.js](server/portal/router.js#L462), [client/src/portal/StaffPages.jsx](client/src/portal/StaffPages.jsx#L264)). Temporary passwords expire after 72 hours and must be changed on first login, but console output, local files, browser screens and mailboxes can retain copies. This is a recommendation for your later decision; **the current admin setup was left unchanged**, as requested earlier.

Proposed fix: Decide a one-time secure delivery/enrollment method, restrict bootstrap execution, avoid retaining plaintext credentials in files/log collectors, and rotate any password that may have been exposed. Verify bootstrap cannot create a second admin or silently reset a live admin account.

### A09 — Keep draft forms out of public event detail (P2, confirmed)

**Resolution (15 October):** Public event detail now returns an empty `fields` array while `formPublished` is false and omits form-version history. Authorized staff retain access to draft questions. A direct API test covers editing a draft, publishing it and unpublishing it again.

Evidence: [server/portal/router.js](server/portal/router.js#L275) returns `fields` for published/closed/cancelled events without checking `formPublished`. The frontend redirects to Coming Soon when the form is unpublished ([client/src/portal/ParticipantPages.jsx](client/src/portal/ParticipantPages.jsx#L435)), but a direct API call can still read the questions. Registration submission itself checks `formPublished`, so this is draft disclosure, not a registration bypass.

Proposed fix: Return only public metadata when `formPublished=false`, or keep draft fields behind staff authorization. Test a coordinator drafting questions while the form is unpublished.

### A10 — Bound or separate form-version history (P2, confirmed)

Evidence: [server/portal/models.js](server/portal/models.js#L151) embeds all `formVersions` in each event. Every changed form appends another full question set ([server/portal/router.js](server/portal/router.js#L672)); `/staff/events` returns this history for all assigned events at once (lines 567–580). Repeated edits increase document/request size and can eventually hit MongoDB's document limit. Registrations also store their own field snapshot, so the retention requirement should be stated explicitly.

Proposed fix: Put versions in a separate collection or impose a tested bounded policy while retaining versions referenced by responses. Paginate/project staff event summaries and fetch one form on edit. Measure worst-case form sizes and response times.

### A11 — Make audits complete and reliable (P2, confirmed)

Evidence: [server/portal/router.js](server/portal/router.js#L74) records only selected staff changes. Event and access updates call `audit()` **after** the main database update. If the audit insert fails, the HTTP request can report failure even though the change committed. Participant sign-ins, profile edits, team changes, registration submissions/edits, staff sign-in/out and failed access attempts are not recorded in this audit collection. Historical registration-review entries may still exist, but new review actions are no longer possible. Logs contain actor/action/target/time, but no old/new values.

Proposed fix: Define the audit event catalog and retention/privacy rules, then write critical change and audit atomically (transaction or outbox). Include sufficient non-secret before/after metadata for investigation and a request/correlation ID. Add tamper-resistant retention/export controls and test failure injection at the audit write.

### A12 — Define what edits mean after coordinator review (P2, confirmed)

**Resolution (15 October):** Registration submissions and edits are recorded immediately without coordinator approval. The staff review endpoint and controls were removed. Existing legacy decisions remain in stored records for history, but current participant/staff views show every response as submitted and exports omit review columns. A missed form-update deadline retains the earlier response; it no longer blocks a coordinator acceptance step.

Original evidence: The earlier [server/portal/router.js](server/portal/router.js) permitted the original submitter to edit while `allowEdits` and the event window were open, then reset an accepted/rejected decision to submitted. With approvals retired, this status transition no longer affects the current flow.

Proposed fix: Choose a policy: lock accepted/rejected records; permit only `access_required` corrections; or create an explicit new revision requiring re-review and notifying staff. Test each status transition and race with a coordinator review.

### A13 — Validate mixed-mode minimum size (P2, confirmed)

**Resolution (17 October):** Mixed-mode minimum is fixed at one in validation and the editor. The registration API also treats older mixed-mode records as minimum one. A direct API attempt to set a higher mixed minimum fails; the maximum remains editable.

Evidence: [server/portal/validation.js](server/portal/validation.js#L144) allows `solo_or_team` with a `minTeamSize` above one. [server/portal/router.js](server/portal/router.js#L837) lets the user choose no team, then lines 853–857 reject the one-person submission. The UI still labels it “Solo or team” ([client/src/portal/ParticipantPages.jsx](client/src/portal/ParticipantPages.jsx#L555)).

Proposed fix: Require minimum one for mixed mode, or model separate solo/team minimums and reflect the actual options in the UI. Add a direct API validation case.

### A14 — Prevent stale response views and clarify failed logout (P2, confirmed frontend behavior)

Evidence: [client/src/portal/useResource.js](client/src/portal/useResource.js#L7) does not cancel or sequence requests when `path` changes, so a slower old category/event response can overwrite a newer filter result. [client/src/portal/StaffPages.jsx](client/src/portal/StaffPages.jsx#L991) changes that path as filters/page change. [client/src/portal/session.jsx](client/src/portal/session.jsx#L79) only clears UI state after the logout POST resolves; a network failure leaves the old authenticated view on screen. Server authorization still decides access, so this is a correctness/session UX issue rather than evidence of a role bypass.

Proposed fix: Abort/ignore stale loads and make logout/error state explicit. Pair this with A02 so local UI clearing and server revocation agree. Test rapid filter changes and a failed logout request.

### A15 — Commit deterministic dependency trees and review installed packages (P2, confirmed)

Evidence: [.gitignore](.gitignore#L5) ignores both `server/package-lock.json` and `client/package-lock.json`; no lockfile is tracked. Both [server/package.json](server/package.json) and [client/package.json](client/package.json) use many caret ranges. A deployment can therefore install a different transitive tree from the one tested. This audit did not run a registry vulnerability scan; absence of a reported CVE here is **not** evidence of clean dependencies.

Proposed fix: Track lockfiles, use clean `npm ci` installs in CI/deploy, run a dependency advisory/license review on those exact trees, and use a controlled update cadence. Review third-party browser scripts/fonts too; [client/src/pages/Homepage.jsx](client/src/pages/Homepage.jsx#L792) dynamically loads a CDN script.

### A16 — Prove capacity with production-like data (P2, not yet measured)

Evidence: [server/portal/router.js](server/portal/router.js#L974) accepts an effectively unbounded page number for category responses; the event response route similarly accepts arbitrary numeric pages (lines 995–1009). Deep `skip()`/`countDocuments()` gets increasingly costly. Limits in [server/portal/router.js](server/portal/router.js#L31) use the default process memory store, so counters are not shared across multiple server instances and disappear on restart. The participant home fetches the full registration history; form editor fetches all assigned events and version history. No measured concurrent-login/submission or export performance is available.

Proposed fix: Add strict page bounds and cursor pagination for growing datasets, shared rate-limit state, and per-route timeouts/metrics. Test realistic peak arrivals, not only 10,000 total accounts: Firebase sign-in, profile save, team invitations, registrations near closing time, staff response review, and CSV/XLSX export. Define acceptable p95 latency/error rates and monitor MongoDB CPU, slow queries, connections, and index use.

### A17 — Treat submitted links as untrusted (P2, confirmed)

Evidence: [server/portal/validation.js](server/portal/validation.js#L14) accepts any HTTP(S) URL for a link question, while the UI describes it as a file/folder URL. [client/src/portal/FormFields.jsx](client/src/portal/FormFields.jsx#L90) opens the destination in a new tab. `noopener noreferrer` is correctly present, but the URL may be a phishing page, a private/inaccessible Drive item, or a link deleted before judging. The server does not fetch the URL, so this is **not** a server-side request forgery finding.

Proposed fix: Decide whether link fields should require Google Drive hosts. Tell participants the required sharing permission, timestamp the submission, and give coordinators a safe review workflow. Consider a pre-deadline accessibility check or a manual “link accessible” review state without storing uploaded files.

## Existing controls worth preserving

- The new portal verifies Firebase ID tokens server-side and requires a verified Google provider for participant login ([server/portal/auth.js](server/portal/auth.js#L107)).
- Portal staff and participant cookies are HttpOnly and use different names; portal JWTs check issuer, audience and session kind ([server/portal/auth.js](server/portal/auth.js#L7)).
- Staff category access is checked in the backend on edits, response reads and exports ([server/portal/auth.js](server/portal/auth.js#L73)); frontend route guards are not the sole authority.
- The unique event/member registration index helps prevent duplicate event registration even if two requests race ([server/portal/models.js](server/portal/models.js#L197)).
- Portal form answers are validated against the saved field definition and React renders response text as text rather than HTML ([server/portal/validation.js](server/portal/validation.js#L70), [client/src/portal/FormFields.jsx](client/src/portal/FormFields.jsx#L79)).

## Verification still required before launch

After choosing fixes, run focused automated tests for each finding, then an independent authorization test using participant, coordinator for category A, coordinator for category B, admin and anonymous sessions. Include direct HTTP calls, not only UI clicks. Run production-domain cookie/CORS checks, concurrent registration/closure tests, MongoDB `explain` on representative 10,000+ participant data, an exact-lockfile dependency scan, backup/restore rehearsal, and a load test with agreed peak concurrency. Review the audit again after deployment configuration is known. **No static review can guarantee that nobody will ever bypass the system.**
