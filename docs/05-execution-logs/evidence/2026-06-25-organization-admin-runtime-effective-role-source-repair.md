# Evidence: organization-admin-runtime-effective-role-source-repair-2026-06-25

## Task Boundary

- Task id: `organization-admin-runtime-effective-role-source-repair-2026-06-25`.
- Branch: `codex/org-admin-effective-role-source-repair-20260625`.
- Entry head: `5f15f8279a3bcd77384dc9c3747f29ad325de491`.
- Scope completed here: runtime role/session source unit tests plus `local-session-runtime` admin role and organization binding repair.
- Explicitly not done: no `.env*`, no credential/private account file, no database connection or row inspection, no schema/migration, no seed execution or mutation, no dev server, no browser/runtime rerun, no Provider/Cost Calibration/staging/prod/payment/external service, no PR/force push, no final MVP Pass claim.

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
- `docs/01-requirements/advanced-edition/modules/04-organization-training.md`.
- `docs/01-requirements/advanced-edition/modules/06-ops-authorization-quota.md`.
- `docs/01-requirements/advanced-edition/modules/08-organization-ai-generation.md`.
- `docs/01-requirements/traceability/2026-06-24-role-separated-mvp-requirement-alignment.md`.
- `docs/01-requirements/traceability/role-experience-fulfillment-matrix.md`.
- `docs/05-execution-logs/evidence/2026-06-24-organization-admin-runtime-effective-role-source-repair-planning.md`.
- `docs/05-execution-logs/audits-reviews/2026-06-24-organization-admin-runtime-effective-role-source-repair-planning.md`.

## Requirement / Role / Acceptance Mapping Result

| Mapping target                       | Result in this task                                                                                                                                                                               |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `org_standard_admin` login session   | Covered by default local runtime unit test. Login response keeps `adminRoles: ["org_standard_admin"]` and hydrates `organizationPublicId` from the fake `admin_organization -> organization` row. |
| `org_advanced_admin` current session | Covered by default local runtime unit test. GET current session keeps `adminRoles: ["org_advanced_admin"]` and hydrates `organizationPublicId` from the fake binding row.                         |
| Global admin organization leakage    | Covered by protection test. A `super_admin` row with an organization binding still returns `organizationPublicId: null`.                                                                          |
| Landing/workspace guard              | Existing boundary/layout tests still pass with the repaired session contract.                                                                                                                     |
| Real browser acceptance              | Not executed in this task; still requires separate approval.                                                                                                                                      |
| Real DB/private account state        | Not inspected in this task; still requires separate approval.                                                                                                                                     |

## Source Changes

- `src/server/auth/local-session-runtime.ts`
  - Added `adminOrganization` join for both admin login lookup and active admin current-session lookup.
  - Selected `organization.public_id` as `organization_public_id`.
  - Added organization-admin role check so only `org_standard_admin` and `org_advanced_admin` expose admin organization binding in the auth context.
  - Kept non-organization admin roles at `organization_public_id: null`.
- `src/server/auth/local-session-runtime.test.ts`
  - Added fake local runtime database query chain for default repository paths.
  - Added red/green coverage for organization admin login and current-session hydration.
  - Added protection coverage for non-org admin role organization binding leakage.

## Red / Green Evidence

| Command                                                                                                                                                                                                                | Result        | Notes                                                                                            |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------- | ------------------------------------------------------------------------------------------------ |
| `npm.cmd run test:unit -- src/server/auth/local-session-runtime.test.ts` before source repair                                                                                                                          | FAIL expected | 1 file ran; 2 failed, 3 passed. Both new tests failed because `organizationPublicId` was `null`. |
| `npm.cmd run test:unit -- src/server/auth/local-session-runtime.test.ts` after source repair                                                                                                                           | PASS          | 1 file passed; 5 tests passed.                                                                   |
| `npm.cmd run test:unit -- src/server/auth/local-session-runtime.test.ts src/server/contracts/user-auth/session-boundary.test.ts tests/unit/admin-dashboard-layout-navigation.test.ts`                                  | PASS          | 3 files passed; 17 tests passed.                                                                 |
| `npm.cmd run lint`                                                                                                                                                                                                     | PASS          | ESLint completed with exit code 0.                                                               |
| `npm.cmd run typecheck`                                                                                                                                                                                                | PASS          | `tsc --noEmit` completed with exit code 0.                                                       |
| `npx.cmd prettier --write --ignore-unknown ...`                                                                                                                                                                        | PASS          | Source/docs files formatted; final write reported listed files unchanged except evidence.        |
| `npx.cmd prettier --check --ignore-unknown ...`                                                                                                                                                                        | PASS          | All matched files use Prettier code style.                                                       |
| `git diff --check`                                                                                                                                                                                                     | PASS          | No whitespace errors.                                                                            |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId organization-admin-runtime-effective-role-source-repair-2026-06-25`                     | PASS          | 7 files scanned; all matched allowed scope; sensitive evidence and terminology scans passed.     |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId organization-admin-runtime-effective-role-source-repair-2026-06-25 -SkipRemoteAheadCheck` | PASS          | Git readiness, evidence path, and audit path passed.                                             |

## Root Cause Hypothesis Matrix

| Hypothesis                                                                              | State after this task              | Evidence                                                                                                                                        |
| --------------------------------------------------------------------------------------- | ---------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| Session role source is `AuthContextDto.user.adminRoles`, not `effectiveEdition`         | Confirmed from planning, unchanged | Existing landing/workspace tests still pass; no UI role source change was needed.                                                               |
| `local-session-runtime` admin session source did not hydrate admin organization binding | Confirmed and repaired             | Red tests showed org admin role existed but `organizationPublicId` was `null`; source now joins `admin_organization` and maps org-only binding. |
| Correct org admin role payload lands/guards correctly                                   | Confirmed from existing tests      | `session-boundary` and `AdminDashboardLayout` tests pass in the focused green set.                                                              |
| Real private/runtime account may still persist as `ops_admin` or use stale DB state     | Still pending                      | DB inspection/browser rerun were explicitly out of scope.                                                                                       |
| Dev seed/source is the direct remaining cause                                           | Not changed in this task           | Seed source was not modified or executed. This task proves runtime mapper behavior only.                                                        |
| Browser acceptance is now passed                                                        | Not claimed                        | No browser/dev server/e2e runtime was executed.                                                                                                 |

## Recommended Next Repair / Verification Task

Suggested task id: `organization-admin-runtime-effective-role-source-db-and-browser-verification-approval-2026-06-25`.

Recommended scope, only if separately approved:

- Redacted local DB/account-state diagnostic for the specific owner-entered organization admin accounts, without exposing credentials or secret URLs.
- If needed, approved local seed/account repair limited to local development data.
- Local browser rerun for `org_standard_admin` and `org_advanced_admin` with owner-entered credentials only.
- Evidence may record role labels, route outcomes, Chinese UI result, and pass/fail summaries only.

Suggested allowed files for that future task:

- `docs/04-agent-system/state/project-state.yaml`.
- `docs/04-agent-system/state/task-queue.yaml`.
- `docs/05-execution-logs/task-plans/2026-06-25-organization-admin-runtime-effective-role-source-db-and-browser-verification-approval.md`.
- `docs/05-execution-logs/evidence/2026-06-25-organization-admin-runtime-effective-role-source-db-and-browser-verification-approval.md`.
- `docs/05-execution-logs/audits-reviews/2026-06-25-organization-admin-runtime-effective-role-source-db-and-browser-verification-approval.md`.
- If approved for execution, the exact DB/seed/browser scripts or evidence files must be listed in that task before use.

Blocked for the future task unless explicitly approved:

- `.env*`, credential/private account files, credential capture, staging/prod data, schema/migration, destructive database work, dependency/package changes, Provider/Cost Calibration, payment/external service, deploy, PR/force push, and final MVP Pass claim.

## Closeout

- Closed at: `2026-06-25T06:14:11-07:00`.
- Final task status: `closed`.
- Result: `pass_local_session_runtime_org_admin_role_organization_binding_repair_no_db_no_browser_no_final_pass`.
- Commit/merge/push/cleanup approval source: current user fresh approval in this turn.
- No final MVP Pass claim.

## Taste Compliance Checklist

- [x] No API JSON `snake_case` was introduced; internal DB row fields remain `snake_case`.
- [x] No empty string was used in place of `null`.
- [x] No self-invented business abbreviation was introduced.
- [x] No schema, migration, seed, package, lockfile, env, Provider, Cost Calibration, staging/prod, payment, external service, browser, or e2e change was made.
- [x] Authorization remains server/session-driven; UI visibility is not treated as the authorization boundary.
- [x] No final standard/advanced MVP Pass is claimed.
