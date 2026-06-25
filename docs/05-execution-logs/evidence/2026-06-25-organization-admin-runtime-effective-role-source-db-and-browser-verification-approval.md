# Evidence: organization-admin-runtime-effective-role-source-db-and-browser-verification-approval-2026-06-25

## Scope

- Task id: `organization-admin-runtime-effective-role-source-db-and-browser-verification-approval-2026-06-25`.
- Branch: `codex/org-admin-db-account-browser-rerun-20260625`.
- Approval consumed: current user approval on 2026-06-25 for local DB/account-state read-only diagnosis, necessary local seed/account repair, and real browser rerun.
- Boundary preserved: no `.env*`, private credential/account files, database URLs, token/cookie/localStorage values, screenshots, traces, raw DB rows, Provider, staging/prod, payment, external service, schema/migration, destructive DB reset/drop/truncate, PR, force push, or final MVP Pass claim.

## SSOT Read List

- `AGENTS.md`.
- `docs/04-agent-system/operating-manual.md`.
- `docs/04-agent-system/sop/requirement-ssot-reading-governance.md`.
- `docs/04-agent-system/sop/task-lifecycle-governance.md`.
- `docs/04-agent-system/state/project-state.yaml`.
- `docs/04-agent-system/state/task-queue.yaml`.
- `docs/03-standards/code-taste-ten-commandments.md`.
- `docs/02-architecture/adr/`.
- `docs/01-requirements/00-index.md`.
- `docs/01-requirements/modules/01-user-auth.md`.
- `docs/01-requirements/modules/06-admin-ops.md`.
- `docs/01-requirements/advanced-edition/00-index.md`.
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`.
- `docs/01-requirements/traceability/2026-06-24-role-separated-mvp-requirement-alignment.md`.
- `docs/01-requirements/traceability/role-experience-fulfillment-matrix.md`.
- `docs/05-execution-logs/evidence/2026-06-24-organization-admin-workspace-runtime-rerun-after-session-hydration-repair.md`.
- `docs/05-execution-logs/audits-reviews/2026-06-24-organization-admin-workspace-runtime-rerun-after-session-hydration-repair.md`.
- `docs/05-execution-logs/evidence/2026-06-25-organization-admin-runtime-effective-role-source-repair.md`.
- `src/db/schema/auth.ts`.
- `src/server/auth/local-session-runtime.ts`.
- `src/server/contracts/user-auth/session-boundary.ts`.
- `src/components/AdminDashboardLayout/AdminDashboardLayout.tsx`.
- `src/db/dev-seed.ts`.
- `src/db/dev-seed.test.ts`.
- `scripts/db/Seed-DevDatabase.ps1`.

## Requirement / Role / Acceptance Mapping Result

| Role                 | Expected landing       | Expected organization routes                                                                                                    | Expected unrelated routes                                   | Observed result                       |
| -------------------- | ---------------------- | ------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------- | ------------------------------------- |
| `org_standard_admin` | `/organization/portal` | Organization portal, training, analytics, org AI question generation, org AI paper generation allowed by current guard behavior | `/ops/users`, `/ops/redeem-codes`, `/content/papers` denied | Pass for local dev seed browser rerun |
| `org_advanced_admin` | `/organization/portal` | Organization portal, training, analytics, org AI question generation, org AI paper generation allowed                           | `/ops/users`, `/ops/redeem-codes`, `/content/papers` denied | Pass for local dev seed browser rerun |

No Standard MVP / Advanced MVP final Pass is claimed.

## Runtime Source Findings

- Login landing uses `createPostLoginSessionBoundary(payload.data.user)`, which resolves organization admin roles to `/organization/portal`.
- `AdminDashboardLayout` uses `/api/v1/sessions` and evaluates `AuthContextDto.user.adminRoles` for workspace allow/deny.
- The previous source repair made `local-session-runtime` hydrate admin role from `admin.admin_role` and organization binding from `admin_organization -> organization`.
- Therefore a correct runtime session payload with `org_standard_admin` or `org_advanced_admin` is sufficient for landing and workspace guard separation in the browser.

## Local DB Diagnostic

Commands executed with local Docker Postgres only:

- `docker compose config --services`: pass, service `tiku-postgres`.
- `docker compose ps`: pass, local container healthy on `127.0.0.1:5432`.
- Database inventory found local databases: `postgres`, `tiku`, and six `tiku_fresh_*` databases.
- `pg_stat_activity` read-only aggregate: only the diagnostic `psql` connection was active at the sampling moment, so it did not prove the running Next database by connection state.

Redacted schema/account aggregate:

| Local DB class                    | Finding                                                                                                                                                                                                                                   |
| --------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Default `tiku` DB                 | `admin_role` enum has only `super_admin`, `ops_admin`, `content_admin`; `admin_organization` table missing; one admin row aggregated as `super_admin`; this DB cannot represent organization admin role/binding without schema/migration. |
| Older `tiku_fresh_*` DBs          | Mostly old `admin_role` enum values; some have `admin_organization`, but not the current org admin role enum set.                                                                                                                         |
| `tiku_fresh_phase25_20260601_001` | Current org admin enum set present; aggregate role counts include `org_standard_admin: 1` and `org_advanced_admin: 1`; `admin_organization` exists with five total bindings.                                                              |

Focused role-state aggregate for the only current-schema candidate DB:

| Role                 | Status   | Admin rows | Organization binding rows | Active session rows |
| -------------------- | -------- | ---------: | ------------------------: | ------------------: |
| `org_standard_admin` | `active` |          1 |                         1 |                   0 |
| `org_advanced_admin` | `active` |          1 |                         1 |                   0 |
| `ops_admin`          | `active` |          6 |                         2 |                   7 |
| `content_admin`      | `active` |         12 |                         0 |                   0 |
| `super_admin`        | `active` |          3 |                         1 |                   0 |

Decision: no seed/account write was executed. The current-schema candidate DB already has the two required organization admin role rows and organization bindings. The stale default `tiku` DB would require schema/migration before it could be repaired as account data, and schema/migration remained outside this task.

## Browser Rerun

Pre-check:

- Local server `http://127.0.0.1:3000/login` responded HTTP 200.
- Playwright skill wrapper could not run on this Windows shell because its bash wrapper expected `/bin/bash`; fallback used repository Playwright package through Node.

Manual headed browser attempt:

- Result: timed out after 180 seconds waiting for owner/manual login for `org_standard_admin`.
- Last sanitized session summary: code `401001`, path `/login`, no admin role, no organization binding.
- No password or private credential was captured.

Automated headed browser rerun:

- Used synthetic local dev seed fixture accounts from `src/db/dev-seed.ts`.
- Credential values were not printed, written to evidence, or copied into docs.
- Output was limited to account label, landing path, session role list, organization binding presence, route class, and logout status.

### `org_standard_admin` Dev Seed Result

- Login landing: `/organization/portal`.
- Session summary: code `0`; `adminPublicIdState=present`; `organizationPublicIdState=present`; `adminRoles=["org_standard_admin"]`.
- Allowed:
  - `/organization/portal`
  - `/organization/organization-training`
  - `/organization/organization-analytics`
  - `/organization/ai-question-generation`
  - `/organization/ai-paper-generation`
- Denied:
  - `/ops/users`
  - `/ops/redeem-codes`
  - `/content/papers`
- Logout: final path `/login`; subsequent session summary code `401001`.

### `org_advanced_admin` Dev Seed Result

- Login landing: `/organization/portal`.
- Session summary: code `0`; `adminPublicIdState=present`; `organizationPublicIdState=present`; `adminRoles=["org_advanced_admin"]`.
- Allowed:
  - `/organization/portal`
  - `/organization/organization-training`
  - `/organization/organization-analytics`
  - `/organization/ai-question-generation`
  - `/organization/ai-paper-generation`
- Denied:
  - `/ops/users`
  - `/ops/redeem-codes`
  - `/content/papers`
- Logout: final path `/login`; subsequent session summary code `401001`.

## Root Cause Hypothesis Matrix

| Hypothesis                                                                                           | Status                                   | Evidence                                                                                                         |
| ---------------------------------------------------------------------------------------------------- | ---------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| Landing and workspace guards use session `adminRoles` as effective role source                       | Confirmed                                | Source read: login boundary and admin layout both consume session user role fields.                              |
| Source-level session hydration was still wrong after prior repair                                    | Excluded for local dev seed path         | Browser session returned exact org role and organization binding state for both fixture accounts.                |
| Current local dev seed org admin rows are stale/missing                                              | Excluded for current-schema candidate DB | Aggregate DB diagnostic found one active row and one binding for both org admin roles.                           |
| Default `tiku` DB is behind current schema                                                           | Confirmed                                | Role enum lacks org admin values and `admin_organization` is missing.                                            |
| Running browser service can authenticate the dev seed org admin accounts correctly                   | Confirmed                                | Both dev seed accounts landed on `/organization/portal` with expected session roles.                             |
| Previous private/owner-entered accounts may still be mapped to `ops_admin` or a stale account source | Pending                                  | This task did not read private account files or capture private credentials; the manual login attempt timed out. |
| A seed/account data repair is needed for current dev seed organization admins                        | Excluded                                 | No data write was necessary after DB aggregate plus browser pass.                                                |
| A schema/migration repair is needed if the default `tiku` DB must become the runtime DB              | Pending separate approval                | Default DB cannot represent org admin role/binding today; schema/migration was not in scope.                     |

## Recommended Next Repair Scope

No source repair is recommended for the current dev seed browser path.

If the owner still wants the old/private acceptance accounts repaired:

- Create a separate `private-org-admin-account-state-reconciliation` task.
- Required approval: private account identifier handling, specific local DB account-row update if proven necessary, and owner/manual credential entry.
- Allowed files: docs state/queue, task plan, evidence, audit only unless a repeatable local account repair script is explicitly approved.
- Allowed DB action: read/update only the two approved local account rows after redacted before/after aggregate evidence.
- Blocked unless separately approved: `.env*`, private credential files, schema/migration, destructive DB, staging/prod, Provider, external services, screenshots/traces containing sensitive data.

If the owner wants default `tiku` DB aligned:

- Create a separate local schema/migration/seed alignment task.
- Required approval: schema/migration plus seed against a named local dev DB.
- Candidate allowed files: `src/db/schema/**`, `drizzle/**`, `scripts/db/**`, `src/db/dev-seed.ts`, `src/db/dev-seed.test.ts`, docs/evidence/audit.
- Rationale: account repair alone cannot add missing enum values or `admin_organization`.

## Validation

- `npm.cmd run test:unit -- src/server/auth/local-session-runtime.test.ts src/db/dev-seed.test.ts tests/unit/admin-dashboard-layout-navigation.test.ts`: pass, 3 files / 18 tests.
- `npm.cmd run lint`: pass.
- `npm.cmd run typecheck`: pass.
- `npx.cmd prettier --write --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-25-organization-admin-runtime-effective-role-source-db-and-browser-verification-approval.md docs/05-execution-logs/evidence/2026-06-25-organization-admin-runtime-effective-role-source-db-and-browser-verification-approval.md docs/05-execution-logs/audits-reviews/2026-06-25-organization-admin-runtime-effective-role-source-db-and-browser-verification-approval.md`: pass.
- `npx.cmd prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-25-organization-admin-runtime-effective-role-source-db-and-browser-verification-approval.md docs/05-execution-logs/evidence/2026-06-25-organization-admin-runtime-effective-role-source-db-and-browser-verification-approval.md docs/05-execution-logs/audits-reviews/2026-06-25-organization-admin-runtime-effective-role-source-db-and-browser-verification-approval.md`: pass.
- `git diff --check`: pass.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId organization-admin-runtime-effective-role-source-db-and-browser-verification-approval-2026-06-25`: pass.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId organization-admin-runtime-effective-role-source-db-and-browser-verification-approval-2026-06-25 -SkipRemoteAheadCheck`: pass.

## Taste Compliance Checklist

- Naming follows existing project role identifiers and terminology.
- No source/API/schema naming changes were made.
- No UI styling, token, or frontend component changes were made.
- No package or dependency changes were made.
- Evidence is redacted and avoids secrets, raw DB rows, credentials, tokens, cookies, localStorage, screenshots, traces, provider payloads, and database URLs.
- No final Standard/Advanced MVP Pass is claimed.

## Closeout Approval

- Fresh closeout approval: user message on 2026-06-25 approving serial task 1 closeout, then task 2 and task 3 execution.
- Local implementation commit before closeout metadata update: `071d7a4dbaec8b2afb7d359d21596f19997a18b8`.
- Approved closeout actions for this task: fast-forward merge to `master`, push `origin/master`, and delete merged short branch.
- Still not approved or claimed: final Standard/Advanced MVP Pass, PR, force push, staging/prod, Provider, payment, external service, `.env*`, private credential capture, schema/migration for this task.
