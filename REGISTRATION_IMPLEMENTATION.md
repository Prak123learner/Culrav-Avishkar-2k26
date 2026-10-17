# Registration implementation

## Scope and sequence

- [x] Audit existing application and preserve the Event 404 link change.
- [x] Identity: permanent CA IDs, Google participant login, separate staff login, temporary passwords, forced first-login password change.
- [x] Administration: festivals/categories, per-category coordinator assignments, revocation and first-admin bootstrap.
- [x] Fixed catalog: 20 categories / 116 existing subevents seeded with original details. Coordinators cannot add/remove/rename subevents.
- [x] Coordinator workspace: read-only About/rules, solo/team participation type and team-size limits, versioned form builder and publication, both registration deadlines, response viewing and Excel/CSV export. Submissions require no approval. Only admins edit About/rules, event status, branch eligibility, opening time and ordinary answer-edit settings. College eligibility is not enforced.
- [x] Participant workspace: profile, category/event discovery, confirmed team invitations, dynamic forms, Drive links, registration confirmation/status, deadline-limited edits and notices for revised forms with preserved response history.
- [ ] Verification: database-backed authorization and workflow tests on standalone MongoDB and a replica set, frontend build, setup/run documentation.

## Decisions

- Firebase Authentication handles Google participant sign-in, and Firebase Admin verifies the token on the server. Personal Gmail and verified Google Workspace identities are supported for external/institute participants.
- Staff accounts have a separate password/session and may use the same email as a participant without elevating that participant account.
- New staff receive a generated temporary password by configured SMTP. Existing staff assignments never silently reset their password. New/explicitly reset temporary passwords expire and must be changed before category access.
- New CA IDs use cryptographically random six-digit suffixes reserved globally across participant and staff identities. Previously issued sequential IDs are retained; IDs are immutable.
- Store attachment links only; never download participant files. Coordinators verify access manually.
- MongoDB is authoritative. Excel/CSV exports are included; automatic Sheets synchronization is a later optional integration.
- Local MongoDB must be configured as a single-node replica set for registration submission and answer edits. Standalone MongoDB now fails those writes closed with 503; the unique event/member index remains a second duplicate safeguard.
- Initial local admin: `culrav@mnnit.ac.in`. Temporary credentials are in the ignored `.local/ADMIN_ACCESS.txt`; first-login change required.
- No GitHub push or deployment. Google credentials, MongoDB and SMTP remain environment configuration, not source code.
