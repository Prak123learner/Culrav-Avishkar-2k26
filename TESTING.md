# Manual registration testing

Use this checklist before rollout. Focused automated checks cover the code paths, but do not replace manual browser and deployment checks.

The static-content migration on 17 October was formatted and passed backend syntax/catalog-shape checks. The local database was queried after migration: 116 event documents remain, zero retain the removed static fields, and five existing published/registered events have locked participation settings. The automated portal suite was not rerun for this migration; complete the checks below before rollout.

## Current local setup

- Frontend: `http://localhost:5173`.
- Backend: `http://localhost:3000`, started from `server` with `npm start`.
- Database: your local MongoDB service, database `culrav_avishkar` on `127.0.0.1:27017`.
- Admin login: `/admin/login`, dashboard `/admin`, email `culrav@mnnit.ac.in`. Initial temporary credentials are in ignored `.local/ADMIN_ACCESS.txt`; do not copy them into this document. Change the password on first login.
- Fixed catalog: 20 categories, 116 subevents. Do not create or delete real registrations as a testing shortcut. Use clearly named disposable participant accounts and agree on cleanup before using this database for live registration.
- Firebase web app configuration is entered for `culrav-avishkar`. Google provider enablement, authorized domains and backend service-account configuration must be completed manually using `REGISTRATION_SETUP.md`.
- No files are uploaded by the portal; attachment questions store links only.
- [ ] Reset-script safety check: with a disposable database backup available, run `npm run reset:festival-data` without the confirmation argument and expect no deletion. It must also refuse a URI without an explicit database name, a missing/mismatched `--database` argument, a missing configured admin, or an invalid retained-admin CA ID. Only an intentional run with matching `--database=<name> --confirm=RESET-FESTIVAL-DATA` may preserve the configured admin and recreate the current catalog as unpublished empty-form events. Check local and Atlas URI formats without resetting the active festival database.

## Before starting

1. Complete Firebase steps A–H in `REGISTRATION_SETUP.md`.
2. Restart the backend after changes to `server/.env` and the frontend after changes to `client/.env`.
3. Keep two browsers or independent browser profiles available: one for staff/admin and another for a participant. Staff and participant sessions use separate cookies, but browser profiles make access testing clearer.
4. Prepare at least three Google participant accounts: a team leader, invited member and unrelated participant. Include a non-MNNIT college account.
5. Prepare two coordinator emails and assign different categories, e.g. CyberQuest and Darkroom. New staff credentials can be delivered manually if SMTP is unset.
6. For API tests, use browser DevTools Network → Copy as fetch, or an API client. Preserve the appropriate session cookie and send `Origin: http://localhost:5173`. Never paste session cookies into shared documents.

## Visual review of portal pages

- [ ] At desktop and mobile widths, open participant sign-in, coordinator sign-in, and first-time password change. Expected: the Culrav–Avishkar mark and festival artwork are visible, while fields, primary actions, errors, and links remain readable and reachable. At a typical 1280 × 720 laptop viewport, both `/login` and `/coordinator/login` fit without page scrolling. The coordinator page background shows the festival city artwork rather than a plain black fill.
- [ ] Open participant Profile, Teams, Registered events, an event registration form, and the updated-answer editor. Expected: headings, tabs, profile details, question controls, deadlines, notices, and submit actions follow the same dark festival styling without clipping or horizontal overflow.
- [ ] Open admin and coordinator dashboards, festival/category/event search results, the form editor and preview, Responses, CA ID lookup, coordinator management, and audit logs. Expected: consistent artwork and typography; festival and category tiles keep readable text over dark artwork while hovered or focused, including immediately after clicking through; long names, tables, and action bars remain usable on mobile.

## 1. Admin first login

- [ ] Open `/admin/login`, enter the initial admin email and temporary password. Expected: password-change form appears immediately, followed by `/admin`. Existing admin sessions visiting `/coordinator` must redirect to `/admin`; coordinators visiting `/admin` must return to their own workspace without admin controls.
- [ ] While signed in as an admin, coordinator, or participant, open `/login` directly and refresh. Expected: redirect to `/admin`, `/coordinator`, or `/portal` respectively after session restoration. Signed-out users should see participant Google sign-in.
- [ ] Try opening coordinator management URLs/API calls before changing the password. Expected: management requests fail with 403.
- [ ] Try an incorrect current password or mismatched new-password confirmation. Expected: actionable error, no access granted.
- [ ] Set a new password with at least 12 characters, a letter and a number. Expected: admin dashboard opens.
- [ ] Sign out, then try the old temporary password. Expected: denied. New password works.
- [ ] After changing it, remove the ignored local initial-password note.

## 2. Coordinator provisioning and scope

- [ ] As admin, grant a fresh email access to CyberQuest. Expected: a temporary password is generated once; it expires in 72 hours. If SMTP is configured, check delivery. If not, the dashboard shows the credential for secure manual sharing.
- [ ] List coordinators again. Expected: no plaintext password or password hash in the list or network response.
- [ ] Sign in as that coordinator. Expected: forced password change before category access.
- [ ] Coordinator sees only assigned categories/subevents. Expected: no create/delete/rename subevent controls.
- [ ] Update assignments for the same email. Expected: no new password generated, old session revoked, existing password still works on the next login.
- [ ] Assign a second category, sign in again. Expected: both categories are visible.
- [ ] Revoke the account while its dashboard is open, then attempt an API operation. Expected: 401; restoring access requires a fresh login.
- [ ] Explicitly reset the coordinator password. Expected: previous sessions/password stop working, new temporary password requires change.
- [ ] Test expiry with a disposable account after its 72-hour lifetime (or arrange a controlled development-only DB expiry adjustment). Expected: expired temporary password cannot log in or be changed.

## 3. Fixed catalog and editing permissions

- [ ] As admin, open `/admin` → Logs. Expected: newest audit entries first, with date/time, staff name/email/CA ID, readable action, target label and record ID. Apply action, staff (name/email/CA ID), target ID and date filters; reset, refresh and paginate. No matches should show an empty state. Perform a category update, coordinator access change or event/form save and refresh logs to see the new entry. Older registration-review logs may remain historical.
- [ ] A participant or coordinator must not see Logs, and direct GET `/api/v1/portal/staff/audits` must reject them (401/403). Audit responses must not expose passwords, hashes, tokens, private keys or submission answers. Logs show the recorded action and target, not a historical before/after diff; older entries may use generic access-change labels.

## Focused session verification — 15 October 2026

Focused security and workflow checks use isolated fixtures, not the live festival database. **13 backend session/API/index/config tests, 4 frontend session-API tests, 11 portal workflow tests, and 1 standalone fail-closed test passed** after the recent changes. The production frontend build also passed. Run `npm.cmd run test:sessions`, `npm.cmd test`, and `npm.cmd run test:standalone` from `server` to repeat (requires client dependencies and temporary MongoDB processes).

Verified: admin/coordinator/participant cookie restoration; eight-hour HttpOnly cookie settings; password-change/revocation invalidation for staff; logout revokes a copied participant/staff cookie while another login remains valid; retired API paths return 404; growth indexes exist; production origin validation; standalone registration rejection; Secure cookies in production; admin-only audit filtering; credentialed frontend requests; correct 401 session clearing; no false logout for login failures, 403 or network errors; stale responses cannot clear a newer login. External Firebase verification is stubbed only in isolated backend tests.

- [ ] After restarting the backend, sign in afresh: cookies issued before the server-side session change are intentionally invalid.
- [ ] Replay a saved participant cookie after participant logout and a saved staff cookie after staff logout through a private local API client. Both `/auth/me` and `/staff/me` should return 401 respectively. Never put real cookies in a shared document.
- [ ] Directly request retired `/api/v1/auth`, `/api/v1/user`, `/api/v1/team` and `/api/v1/event` URLs. They should return 404; `/api/v1/portal/categories` should still work.
- [ ] Inspect response headers for anonymous public reads. `/api/v1/portal/categories` and `/api/v1/portal/events` must return `Cache-Control: public` plus CDN cache headers. Categories should use a 5-minute browser / 1-hour CDN window; event listings 15 seconds / 60 seconds. `/api/v1/portal/event-content` must return 404 because public descriptions, rules and contacts are now bundled static files.
- [ ] Inspect `/api/v1/portal/events/:id`, `/auth/me`, `/staff/me`, `/profile`, `/teams`, `/registrations`, every `/staff/*` response, exports, and all mutation responses. Expected: `Cache-Control: no-store` and no public CDN cache header. Confirm that participant, registration, response, and staff data are never returned from a shared cache.
- [ ] In the deployed site, request the same public endpoint twice and inspect `x-vercel-cache`: after the first miss, a repeat within its CDN window should be served from cache. Registration form publication and deadline changes through `/events/:id` must remain immediate. A static description/rule/contact change should appear only after rebuilding and deploying the frontend.
- [ ] Confirm new indexes finished building in the target MongoDB and inspect `explain("executionStats")` for team membership/invitations, participant history, event response listing and export on representative data.
- [ ] On the deployed HTTPS site, verify frontend-origin `/api/v1/*` proxying, Firebase authorized domain, login/refresh/logout, registration writes and Excel/CSV exports. Vercel supports the Express backend directly; a two-project setup still needs a frontend rewrite, and the backend entry must connect to MongoDB before serving requests.
- [ ] In Edge, test popup sign-in on localhost and the deployed frontend. With popups allowed, click Continue with Google and select an account. Expected: Firebase popup uses `culrav-avishkar.firebaseapp.com`, one `POST /auth/google` completes, and the requested event or `/portal` opens. Refresh to verify the backend session cookie survives. A signed-out `/auth/me` 401 before login is expected; a 401 after successful login needs separate cookie investigation.
- [ ] In a fresh Edge profile with default popup settings, open `/login`. Wait for Preparing sign-in to finish and click Continue with Google once. Repeat with DevTools network throttling. Check first-click and second-click behavior separately. Preparation must finish loading Firebase's popup helper before enabling sign-in; a slow connection must not enable an unprepared popup after five seconds. If preparation fails, retry it without opening a window. The guarded Firebase 12.19 internal preparation adapter must be rechecked before SDK upgrades. Record the exact Firebase error if the first click still fails.
- [ ] Explicitly block popups for the frontend in Edge, then click Continue with Google. Expected: first failure suggests clicking again; a repeated failure explains the browser's site setting. No full-page redirect or `/auth/google` POST should occur. Allow the popup using the address-bar icon and retry. Close the popup without choosing an account and retry again; the button must become available. Rapidly click the button; only one login attempt should be active.
- [ ] Open Register Now for an unregistered solo event. Network should show the event resolve request and `/events/:id/my-registration`, with no full `/registrations` request and no `/teams` request. For team events, the team selector still loads `/teams`. Register, revisit as leader and as an accepted member, and confirm both go to the existing registration. Another participant must receive `{ "registration": null }`. Repeat after session expiry; the lookup must return 401. Compare request timings before/after on the deployed backend; Vercel cold starts and Atlas latency remain possible.
- [ ] Open My Teams, switch to Profile, then return to My Teams. Previously loaded teams should appear immediately while one background request refreshes them. Send an invitation from another account, click Refresh teams, and confirm it appears. Create, accept, decline, remove, and register a team; confirm names, CA IDs, invitations and roster locks remain correct. Test an account with no teams and a legacy registration without `membershipLockedAt`.
- [ ] Log out and log in as another participant on the same browser. Neither the teams page nor the registration team selector may display the previous participant's cached teams. Window focus changes and idle time must not trigger team polling. Team responses must keep `Cache-Control: no-store`; only the current session's React Query memory cache is used.

- [ ] In a real browser, sign in as each role and reload/reopen the page. Expected: the appropriate dashboard/session restores. Participant and staff can coexist in the same browser; admin/coordinator use the same staff session slot, so signing into another staff account replaces the previous staff login.
- [ ] Open two tabs for the same session type. Logout in one; the other should clear its matching session without clearing the other session type. Switch back to an older/background tab after expiry or staff revocation; focus/visibility revalidation should return to login. An API 401 should also clear that session immediately; no need to wait for a manual refresh.
- [ ] While offline, switch tab focus. Existing UI identity should not be cleared just because requests fail. Restore connectivity; returning focus revalidates it. Check Google popup and browser cookie behavior manually; these were not exercised by the isolated tests. Sessions have a fixed eight-hour lifetime rather than a sliding renewal.

- [ ] Export CSV and Excel after multiple form revisions. Unchanged questions must share one column with the plain question label; instructions/required/order-only changes must not duplicate it. Renamed questions retain their respective labels. Questions with changed answer types/options must stay separate, using an earlier-form suffix if labels are identical. Duplicate question labels or labels matching built-in profile columns must receive distinct headers. Every historical answer must remain aligned with its question.

## Registration deadline and form-update checks

The 17 isolated portal workflow tests and the frontend production build passed on 17 October 2026. These tests use temporary fixtures and do not write registrations to the live festival database.

- [ ] As coordinator, publish a form with no registration deadline. Expected: publication succeeds, new registrations remain open while the event/form are published, and no deadline notice is shown on the participant page. Then set a future deadline, extend it before and after it passes, and verify the page and new registrations follow the latest value.
- [ ] Register a solo participant and a team, then revisit each event's public Register Now route as the participant and as a non-leader team member. Expected: the portal opens Registered events, shows an Already registered notice, scrolls to and highlights the matching registration, and never displays a second blank form. Repeat after the form is unpublished; an existing registrant still reaches their saved registration while an unregistered visitor reaches Coming Soon.
- [ ] Open DevTools Network, click Register Now from several public event categories, and inspect the initial lookup. Expected: each click calls only `/api/v1/portal/events/resolve?festival=…&category=…&title=…`; it must not call the full `/events` catalog and must not immediately follow with `/events/:id`. Unknown festival/category/title combinations should reach Coming Soon without exposing a draft form.
- [ ] In the coordinator editor, optional Registration closes appears beside Publish registration form on desktop and stacks cleanly on mobile. Its help text explains that blank means open indefinitely. A new or unchanged form shows no updated-answer date input. The participant page shows the closing time only when one is configured and never shows the updated-answer deadline.
- [ ] Add or change a question on a published form with an existing response. Before saving, the editor shows an existing-participants review notice and requires a future updated-answer deadline. Changing instructions alone or editing an event with no responses does not show that date input. The saved update appears only to affected participants in Registered events, with its deadline next to the review notice; other registrants and new visitors do not see it.
- [ ] GET `/api/v1/portal/staff/events/:id/response-status` should return whether an assigned event has responses or pending form updates. An unrelated coordinator or signed-out visitor must be denied.
- [ ] After publishing an update, use Extend existing participant review deadline without changing questions. Expected: the new date saves, while the updated-answer date input stays hidden until the extension control is opened. Try opening the same editor in another tab while a new response arrives; a rejected save should refresh the response check and reveal the required deadline.
- [ ] As admin, verify the event editor has no deadline controls. Try changing either deadline directly through the staff API; both changes must return 403. Coordinators can set or extend both the new-registration and updated-response deadlines.
- [ ] Register before the initial deadline, then have the coordinator change a question and set a later updated-response deadline. After the initial deadline passes, submit revised answers and correct them again. Both saves must work before the updated-response deadline; after that deadline, correction must be rejected. The original registration remains recorded.
- [ ] For a Solo or team event, verify the editor shows a fixed minimum of one and allows changing only its maximum. Register individually and as a team. A direct API attempt to set mixed-mode minimum above one must fail, including for an older event saved with such a minimum.
- [ ] Edit only a question's instructions/help text: existing participants must not be asked to resubmit. Change its Required setting: they should see a review notice, but their previous answer remains prefilled. Rename the question or change its type/options: the previous answer should be cleared for that question.

- [ ] As coordinator, open Events → festival → assigned category → View category responses. Expected: paginated registrations from every event in that category, with event names, participant/team details and submitted answers, without approval controls. Filter to a single event and export Excel/CSV. Clearing the filter returns to all category responses; Back preserves the category selection.
- [ ] Request `/api/v1/portal/staff/categories/:id/registrations` for an unassigned category. Expected: 403 and no response data. Supplying an event from another category in `eventId` must be rejected. Admin may view every category. Empty categories should show No responses yet.

- [ ] Compare the 20 files under `client/src/data/event-catalog/<festival>/<category>/subevents.json` with the public category pages. Expected: 116 events total with the same names, descriptions, rules, contacts and original details. Open public event pages with the backend stopped; all editorial content must still render with no stale-data flash or MongoDB request.
- [ ] Confirm neither admin nor coordinator event editors contain About, rules, or public-contact controls. Direct staff API requests containing `description`, `rules`, `contact`, `coordinators`, or `sourceData` must not persist those fields. Make a controlled JSON edit, rebuild the frontend, and verify the public page reflects it.
- [ ] Events must initially show two festival boxes: Avishkar and Culrav. Open one, then a category, then an event. Use breadcrumbs to go back; saving an event or closing responses should preserve the chosen category. Search for `Darkroom` and `Picture Tale`: category results and event results must be separately identifiable and directly usable, with festival/category context. Empty/unmatched searches show appropriate results or empty states. Coordinators must never see unassigned category/event results.
- [ ] Navbar must have no REGISTER button on desktop or mobile. `/portal/events` must no longer show a registration directory. Individual event Register Now buttons and legacy `/portal/events/:id` redirects must still work. Check admin/coordinator login, password-change, dashboard and event editor styling at desktop/mobile widths.
- [ ] Before first publication, an assigned coordinator can switch an event between Solo, Team and Solo or team and set valid sizes. First publication must set `participationLockedAt`; unpublishing must not clear it. Afterwards the coordinator controls are disabled and a direct API change returns 403. Invalid limits and unassigned-event changes must also be rejected.
- [ ] After first publication, an admin can make a protected participation correction. If registrations exist, changing mode must return 409; narrowing the size range so any existing registration falls outside it must return 409. A compatible size change should save and create both the normal event audit and `event.participation.update` audit.
- [ ] Open Admin event settings. Expected: Eligible colleges is absent; Eligible branches is still available. Set a branch restriction and verify an ineligible branch is rejected. A participant from another college with an eligible branch should not be blocked because of their college, including for an event that previously stored eligible colleges.
- [ ] As an assigned coordinator, toggle **Allow answer edits before closing** beside the form publish controls and save. Expected: the setting persists; the submitting participant sees **Edit answers** in Registered events while registration is open, and the button disappears after closing. An unassigned coordinator must receive 403 for the same event.
- [ ] Coordinator sends a direct PUT containing `title`, `categoryId`, opening date, status, legacy contact or eligibility changes. Expected: 403, even if the hidden UI is bypassed. Admin can still edit these operational fields. A non-boolean `allowEdits` value must be rejected.
- [ ] Send POST `/api/v1/portal/staff/events` or DELETE `/api/v1/portal/staff/events/:id`. Expected: 405; fixed events cannot be added/removed through the portal.
- [ ] Use a coordinator from another category to read responses/export or update an event using its known ID. Expected: denied.
- [ ] Run `npm run bootstrap` again only when intentionally checking seeding. Expected: no duplicate fixed events; forms, registration settings and existing admin password are retained. The seed must use `registration-catalog.json` and must not create description/rule/contact/source fields in MongoDB.
- [ ] Publish a form as an assigned coordinator without admin approval, including an older event whose stored `configurationRequired` flag is true. Expected: no approval notice or checkbox, and registrations are accepted when event status/dates permit. Coordinators cannot change admin-only status, opening date or eligibility.
- [ ] Run `npm run migrate:static-content` from `server` against local MongoDB. Expected: published/registered legacy events gain `participationLockedAt`, and every event document loses `description`, `rules`, `contact`, `coordinators`, and `sourceData`. The command must refuse a non-local MongoDB URI.
- [ ] In admin and coordinator event lists, confirm participation and form status read naturally, such as “Solo or team · Registration form draft” and “Team · Registration form published”; raw mode codes and `Form v1` should not appear on the event cards.

## 4. Form builder

- [ ] Leave blank/whitespace-only options before, between and after valid options for Dropdown, Multiple choice and Checkboxes. Preview and participant forms must show only valid choices, with no blank selectable rows. Saving must ignore those unused rows; at least one nonblank unique choice is still required.

- [ ] Select Dropdown, Multiple choice and Checkboxes as question types. Expected: individual inline option rows with automatic numbers, circles or squares respectively, rather than a multiline textbox. Add/remove options, press Enter to insert/focus the next option, and switch types; existing option text stays intact and symbols update. Save/reopen and preview: dropdown/radio/checkbox controls must contain exactly those choices. Blank/whitespace-only options are ignored in preview and saved forms; duplicate nonblank choices and questions with no nonblank options remain invalid; only one blank initial option is shown for a new choice question.

- [ ] Publish registration form appears in a highlighted panel below the questions beside Save subevent & form. Toggle it and save; reopen to confirm the value persisted. For an already-published form, the editor shows Update published form; saving changed questions updates the live version. Check visibility and wrapping on mobile.
- [ ] Draft questions for a publicly listed event are visible to assigned staff, but an anonymous `GET /api/v1/portal/events/:id` returns `fields: []` and no form-version history while `formPublished` is false. Publishing reveals the current questions; unpublishing hides them again.
- [ ] After admin/coordinator login, desktop and mobile navigation show the staff workspace link and Sign Out instead of LOGIN. Signing out clears the staff navigation state, including after refresh; a failed sign-out request shows an error.

- [ ] Add and preview all types: short text, paragraph, number, date, dropdown, radio, checkbox and file/folder link.
- [ ] Switch a question to File / folder URL. Its Instructions box should start with the file-access reminder, remain editable, and display the saved custom wording in preview and the participant form. Open an existing link question with blank instructions; the editor should supply the reminder there too.
- [ ] Add instructions, toggle required questions, reorder questions, remove a question and save. Expected: the preview and participant form agree.
- [ ] Try duplicate choices, no choices for a choice question, empty question labels, or more than 50 questions. Expected: clear validation error, no corrupted saved form.
- [ ] Save without publishing. Expected: event can be browsed but registration cannot be submitted.
- [ ] Publish the form. Expected: registration opens when event status and time window permit it, with no admin approval step.
- [ ] Change a published question after a test submission. Expected: new form version for future submissions, old question labels/answers retained on the earlier registration and in exports.
- [ ] After an existing response, try changing a published form without a response-update deadline. Expected: the coordinator editor asks for a future deadline before saving. An admin cannot set that deadline; the coordinator must set it. The registration page displays only the new-registration closing time, while affected participants see the update deadline in Registered events.
- [ ] Add a question and change an existing question while leaving another unchanged. Registered events should name the event and request a form update by the deadline. Review updated form must prefill only the unchanged answer; new and changed questions start blank. Submit, then confirm the notice clears, the current response uses the new form version, and the original response appears in history. No approval is needed.
- [ ] Close new registrations before the response-update deadline. The original submitter should still be able to answer the revised form until that deadline; after it, direct API submission must fail. Question reordering alone must not show a form-update notice.
- [ ] For a team response, every member should see the update notice, but only the team leader can submit the revised answers. Coordinator responses should show updates awaiting participants; revised submissions appear immediately. If the deadline expires, the old submission remains recorded with its earlier answers.
- [ ] Open the same form in two staff tabs; save one then save the stale tab. Expected: conflict response requiring reload, no silent overwrite.
- [ ] Forms with no custom questions should register only when intentionally published; profile details still accompany the registration.

## 5. Participant Google login and CA IDs

- [ ] Select B.Tech, MBA and MCA in an unsaved profile: Year must offer 1–4, 1–2 and 1–3 respectively. Switching course must clear the selected year. Year is required, saves correctly and becomes disabled with the other saved fields. Existing participants without a year must complete it before registering.
- [ ] Send a profile request with a missing/zero/negative/fractional/out-of-range year or a non-numeric value. Expected: rejected, including MBA Year 3 and MCA Year 4. Confirm the saved year appears in prefilled registration details, coordinator responses and new Excel/CSV exports. Previous registration snapshots remain unchanged.

- [ ] Open cultural and technical event Explore panels on desktop and mobile. Register Now should retain the original black button, cyan border, offset cyan/fuchsia shadows, scanline overlay and arrow. Desktop placement is bottom-right; mobile placement follows the event details. Clicking must still open the corresponding registration flow.

- [ ] Open `/portal` with a complete profile. Expected: Registered events is selected and shows only this participant's registrations, their status and submitted answers. There is no Events directory tab or duplicate Registrations tab. Profile and Teams remain available; a new participant sees the empty registered-events state.

- [ ] Visit `/culrav/darkroom`, Explore Picture Tale and click Register Now. With its form published, expect the matching native registration form. Repeat from an Avishkar event page.
- [ ] Sign out before clicking Register Now on a ready event. Expected: Google login, then return to that exact event. Complete an incomplete profile when prompted; saving returns to the same form.
- [ ] On the registration form, check the read-only CA ID, name, email, college registration number, college, branch and phone against the saved profile. These details must accompany submission without being entered again. No Edit profile link should appear. An incomplete participant can complete the profile once and return to this form.
- [ ] Save a complete profile. Expected: a confirmation popup lists name, Google email, college, registration number, course, year, branch and phone. Confirm and save stays disabled until the acknowledgement checkbox is ticked. Go back preserves unsaved fields. After confirmation, all fields become disabled/grey and no Edit profile button appears, including after refresh. A failed save leaves the form editable. CA ID and Google email remain fixed throughout.
- [ ] In an unsaved participant profile, enter a phone number. Only digits remain in the field; typing stops at 10 characters, and pasting letters, symbols or more than 10 digits is rejected instead of silently truncating it. The form popup says only “Invalid number” for a bad value. The form and direct PATCH `/api/v1/portal/profile` accept exactly 10 digits starting with 6, 7, 8, or 9. The API rejects numbers starting with 0–5, 9 or 11 digits, spaces, country-code prefixes, letters and punctuation with the same short message. An invalid number must not lock the profile.
- [ ] Try PATCH `/api/v1/portal/profile` without acknowledgement, then repeat it after a successful save with a different name, email or other detail. Expected: first request is rejected and repeat save returns 409 without changing the stored profile. Existing complete profiles saved before this change must also be read-only.
- [ ] Open the same unsaved profile in two tabs. Save from one tab, then attempt to save from the other. Expected: the second save is rejected and the second tab reloads the now-locked profile instead of overwriting it.
- [ ] A new profile defaults college to MNNIT Allahabad but permits another college. Course options are B.Tech, MBA and MCA; Branch shows full names, with one Mechanical Engineering entry and a separate Materials Engineering entry. Other reveals a required branch textbox; its entered value persists and is shown on registration forms. Missing course/branch must prevent save.
- [ ] Attempt a direct ready-event registration URL with an incomplete profile. Expected: redirect to the profile before the form appears, then return to the chosen event after confirming and saving. Existing profiles missing the newly required course must complete it first. Direct registration/team submission requests must also reject incomplete profiles.
- [ ] Register Now must keep the event-based `/register/:festival/:category/:title` URL, including after Google sign-in/profile completion. An old `/portal/events/:id` link must redirect to that event-based URL. The registration page shows the form and prefilled details, without the repeated About/rules panel. Check matching black/cyan styling, typography, responsive fields and submit-button shadows.
- [ ] Unpublish an event form. Register Now and the direct `/portal/events/:id` URL must both lead to `/coming-soon`, including for signed-out visitors. Publish it as a coordinator and expect the form to open again without admin approval. A published form with zero custom questions must still allow registration using profile details.
- [ ] Stop the API and click Register Now. Expected: a retryable connection error, rather than a misleading Coming Soon page.

- [ ] After changing Firebase/Vite configuration, restart the frontend and reload `/login`. Click Continue with Google. Expected: the Google account popup opens without `Component auth has not been registered yet`. Complete sign-in and confirm the backend creates the session. If a previous dependency bundle remains cached, restart with `npm.cmd run dev -- --force` from `client` and reload the page.

- [ ] Open `/login` and continue with Google. Expected: Google popup followed by participant dashboard; no participant password is requested.
- [ ] Confirm the account appears under Firebase Authentication → Users, and the festival profile appears in local MongoDB's `festparticipants` collection.
- [ ] Complete profile details. Expected: a permanent CA ID is visible, alongside the verified email. Every ID starts with `CA`, using the format `CA-YYYY-000001` (for example, `CA-2026-000001`).
- [ ] Sign out and return using the same Google account. Expected: same participant record and CA ID, no duplicate.
- [ ] Test Gmail and an external/institute Google Workspace account. Expected: both work when their organization permits Google sign-in to this Firebase project.
- [ ] Use the same email as a coordinator for participant Google sign-in. Expected: separate participant identity; no staff access is granted.
- [ ] Modify a request to include a different `caId`, email or role in profile updates. Expected: identity fields are not changed and privileges are not granted.
- [ ] Tamper with/omit the Firebase ID token, or use an expired/revoked token. Expected: rejected, no account/session created.
- [ ] Inspect DevTools frontend source/network. Expected: Firebase web identifiers may be visible; no Admin private key, SMTP password, JWT signing secret or Mongo URI is exposed.

## 6. Solo registration

- [ ] Try registering before completing profile. Expected: profile completion required.
- [ ] Choose a published solo event, answer questions and submit. Expected: registration ID and submitted status, visible in My Registrations.
- [ ] Leave required questions empty, submit invalid numbers/dates/options, or a `javascript:` file URL. Expected: rejected in the UI or by the server.
- [ ] Double-click submit or send two simultaneous registration requests. Expected: exactly one registration, duplicate request rejected.
- [ ] Alter the submitted participant/member IDs. Expected: backend uses the authenticated participant, not client-supplied identity.
- [ ] Check the stored record and export: CA ID/profile snapshot, form version, answers and submission time are included.

## 7. Team and mixed participation

- [ ] Leader creates a team, invites another participant by CA ID. Expected: invitation appears in the invited participant's dashboard.
- [ ] Invite a nonexistent CA ID, invite the same person twice or invite an existing member. Expected: rejected.
- [ ] Before acceptance, attempt registration. Expected: pending invitations block team submission.
- [ ] Uninvited participant attempts to accept an invitation by team ID. Expected: denied.
- [ ] Member declines, then leader invites again. Expected: the invitation can be accepted on the second attempt.
- [ ] Accepted member tries to register the team. Expected: only leader can submit.
- [ ] Use too few/too many members, an incomplete member profile or ineligible branch. Expected: server rejects submission. College alone must not cause rejection.
- [ ] Leader submits valid team registration. Expected: one registration record, visible to every snapshotted member.
- [ ] A member attempts to enter the same event with another team/solo. Expected: duplicate-member conflict.
- [ ] After team submission, try inviting, accepting/declining a pending invitation, removing a member or leaving through the UI and direct API. Expected: the team roster is locked and all changes are rejected, including for older teams that already have registrations. Create a new team for a different roster. A saved participant profile cannot be edited; earlier registration snapshots remain unchanged. New response views and Excel/CSV exports include separate Course and Branch fields. Historical snapshots without a course remain unchanged.
- [ ] In a solo-or-team event, test both individual submission and leader submission for a confirmed team. Expected: both obey the event's configured limits.

## 8. Deadlines and editing

- [ ] Test before opening, after closing, unpublished form, closed/archived/cancelled event and unconfirmed participation setup. Expected: registration is refused by the backend.
- [ ] Enable answer editing as admin or assigned coordinator. With no registration deadline, the submitter can edit while the event/form remain published. After setting a deadline, edits work before it. Expected: the original form version remains and new answers save immediately without approval.
- [ ] A nonleader team member or unrelated participant attempts to edit. Expected: denied.
- [ ] Disable edits, unpublish/close the event, or pass a configured deadline. Expected: edits fail even if an old browser form remains open. Clearing the deadline should reopen edits when answer editing and the event/form are still enabled.
- [ ] Attempt the retired `PATCH /api/v1/portal/staff/registrations/:id` endpoint directly. Expected: 404; staff response pages have no review form, and old accepted/rejected records display as Submitted.
- [ ] Have two tabs edit the same response. Expected: revision conflict prevents lost updates.

## 9. Drive submission links

- [ ] Submit accessible links for an image, audio, video, PDF and folder. Expected: text links stored; no upload to the app server or Firebase Storage.
- [ ] Coordinator opens each link using their reviewer account. Expected: intended file is viewable.
- [ ] Submit a link without viewer permission. Expected: website does not falsely promise automatic access verification; coordinator can inspect but cannot approve/reject or send a correction request through the response page.
- [ ] Participant fixes sharing or updates the link while editing is enabled. Expected: coordinator sees the changed link in the response view.
- [ ] Try deleting/changing the Drive file after submission. Record the limitation: links do not freeze file contents. Agree on archival/deadline policy before judging.

## 10. Responses and exports

- [ ] Check all event responses and next/previous pagination (50 registrations per page).
- [ ] In Event → Responses, search by a team name, any team member's name, and a full or partial CA ID. Expected: matching registrations and count only, across all result pages. Clear restores the full list. Repeat in category responses and combine search with its event filter; an unassigned coordinator must still be denied. Search for `.*` literally and confirm it does not match everything.
- [ ] Run `npm run migrate:registration-search` from `server` after deploying this version. Search existing and newly submitted registrations by team name, participant-name word, full CA ID, and final six CA-ID digits. Expected: both event and category response views return the intended records.
- [ ] Download Excel and CSV from event responses. Expected: the selected button shows a spinner and “Preparing…” while the file is generated; both export buttons are disabled until download starts or an error appears. A failed export clears the loader and shows an error.
- [ ] Export CSV and XLSX; open them in Excel and import CSV into Google Sheets. Expected: CA IDs, member details, team, question/version labels and answers align; approval status and review-reason columns are absent.
- [ ] For an event accepting both solo and team entries, submit one of each. CSV and XLSX must contain two data rows (one per registration), with Entry type and Member count. The team row must show its team name and leader profile, not duplicate the answers for every member. The coordinator response view must still show every team member.
- [ ] In both `/admin` and `/coordinator`, use CA ID lookup with a full ID and its last digits. Both roles should see the participant profile. Admin should see registrations across all events; a coordinator should see only registrations in assigned categories. Try an ID matching multiple participants and refine the suffix.
- [ ] Create new participant and staff accounts. New CA IDs should have non-sequential six-digit suffixes unique across both roles. Existing issued IDs should stay unchanged, including saved registration snapshots.
- [ ] Include commas, quotes, line breaks, Hindi text and spreadsheet formula-like text in disposable answers/profile names. Expected: valid cells and no executed spreadsheet formulas.
- [ ] Export after question renaming/removal. Expected: older response columns still identify their form version.
- [ ] Try export as participant, logged-out user or wrong-category coordinator. Expected: denied.
- [ ] Automatic Google Sheets sync is not implemented; test file export/import instead.

## 11. UI, sessions and operational checks

- [ ] Test desktop and mobile widths, keyboard navigation, required-field errors, long rules and long answers.
- [ ] Refresh participant/staff pages, sign out and use Back. Expected: API data remains protected; expired/revoked sessions cannot perform actions.
- [ ] Open an event that is already registered, allow its redirect to Registered events, then refresh, switch to Profile, and switch to Teams. Expected: the one-time notice/highlight does not reappear or scroll the page again.
- [ ] Test backend temporarily unavailable. Expected: error shown without falsely confirming a registration.
- [ ] Confirm original homepage, category pages, gallery, team and sponsors still render.
- [ ] Verify frontend/back origins match `.env` and that production cookies use HTTPS. Do not mix `localhost` and `127.0.0.1` during local cookie-based testing.
- [ ] Restart the backend after source/environment changes; `npm start` runs plain Node and does not watch edits. Use `npm run dev` for watching during development.
- [ ] Deploy `client` and `server` as separate Vercel projects. Open `/login`, `/portal`, `/coordinator/login`, and a public event URL directly and refresh each. Expected: frontend routes return the Vite app; backend routes reach Express and connect to MongoDB without running `server.js`.
- [ ] With `www.example.edu` for the frontend and `api.example.edu` for the backend, sign in and call protected portal routes. Expected: credentialed CORS succeeds and session cookies remain valid with `COOKIE_SAME_SITE=lax`.

## 12. Before 10,000+ participants

- [ ] Use a separate staging database for load testing. Never generate load against real participant records.
- [ ] Define expected concurrent users and deadline burst size. Total account count alone is not a capacity target.
- [ ] Test sign-in bursts, browsing, team invites and simultaneous registrations. Track p95 latency, errors, CPU/memory, database connections, index use and duplicate rejection.
- [ ] Campus users can share an IP. Confirm sign-in rate limits do not block ordinary shared-network usage; verify credential-guessing protection still works.
- [ ] Verify backups and perform a restore rehearsal.
- [ ] On an isolated empty MongoDB database, run `npm run initialize:fresh-festival -- --database=culrav_avishkar_2027 --confirm=CREATE-FRESH-FESTIVAL-DATABASE`. Expected: a new admin at `culrav@mnnit.ac.in`, a one-time temporary password, all indexes, and the fixed empty-form catalog. Repeat against a non-empty database. Expected: the script refuses without modifying it.
- [ ] Configure a single-node replica set locally or use a managed replica set. Standalone MongoDB must reject registration submission and answer edits with 503; on a replica set those writes should succeed transactionally.
- [ ] Agree on event deadlines, coordinator access, account recovery, Drive retention and operator contacts.
- [ ] Confirm retired `/api/v1/auth`, `/api/v1/user`, `/api/v1/team`, `/api/v1/event` and old dashboard routes return 404. Existing legacy collections remain stored but are not exposed by those routes.

## Earlier checks (historical, not final sign-off)

- Frontend production build passed before the latest revisions.
- New portal files passed scoped ESLint before the latest revisions.
- Seven workflow scenarios passed against isolated standalone MongoDB before later catalog/seeding and rate-limit changes.
- Replica-set workflow tests were rerun after the CA ID lookup/export changes; all eleven scenarios passed.
- Local API smoke check returned 20 categories / 116 events, and frontend returned HTTP 200.
- Live Firebase popup login and SMTP delivery were not verified.
- Browser automation could not reach the local preview, so visual inspection remains manual.

## Test record

### Data loading indicators

- With network throttled, open an event's Register Now link: a themed spinner and skeleton should appear during event resolution and registration checks, without a blank text-only page or a percentage.
- Check Teams, Registered events, staff Events, Responses, and Audit logs: the loading indicator should disappear when data or an error arrives. Team selection in a registration form should show an inline loader while teams are fetched.
- Repeat for Avishkar and Culrav registration routes, at mobile width, and with reduced motion enabled. Verify loaders remain readable, do not overflow, and stop animating with reduced motion.


### Deployed Edge popup diagnostics

- Deploy the frontend and open `/login?authDebug=1` in Edge. These opt-in browser logs also work in production; no backend `NODE_ENV` change is needed.
- In DevTools Console, enable Info messages and Preserve log. Filter for `CA auth debug`, wait for preparation, then click Continue with Google once.
- Capture the sequence from `preparation:start` through `popup:failed` or `backend-login:success`. It records the public auth domain, browser, trusted click, user activation, actual `window.open` timing/result and error codes. It never records popup URLs, tokens, account details or passwords.
- If `window.open:called` has inactive user activation, the SDK delayed opening past the click activation. If activation is active but `windowReturned` is false, the browser rejected the window despite the click; inspect site popup permissions and browser policies. If `popup:success` appears, investigate the later backend/session stage separately.
- Verify normal `/login` emits no diagnostic logs. Debug tracing forwards the original `window.open` call unchanged and restores it when the popup operation settles. Remove `?authDebug=1` to disable diagnostics.


### Staff navigation and action alignment

- Open `/admin`: confirm there is no Categories tab, while Events still supports festival/category navigation and coordinator assignment still lists categories.
- Check CA ID lookup, Create team, and response search on desktop: action buttons should line up with the inputs, below their labels.
- Repeat at a 375px mobile width: controls should wrap without horizontal overflow, clipped labels, or overlapping buttons.
- Check action-only toolbars (exports, save/cancel, audit pagination) still wrap cleanly and remain usable.


| Date | Tester | Section / case | Result  | Notes / issue |
| ---- | ------ | -------------- | ------- | ------------- |
|      |        |                | Not run |               |
