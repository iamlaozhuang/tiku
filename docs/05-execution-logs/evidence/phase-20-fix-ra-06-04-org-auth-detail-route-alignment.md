# Phase 20 Fix RA-06-04 Org Auth Detail Route Alignment Evidence

## Summary

- Result: pass on task branch; merge/push cleanup pending.
- Scope: implementation/local_verification.
- Changed surfaces: task plan, evidence, project state, task queue claim, `org_auth` detail contract/service/repository/route/UI/tests.
- Gates: RED/GREEN focused unit, adjacent unit, lint, typecheck, full unit, e2e, build, readiness, naming, format, diff check, and unified quality gate passed.
- Forbidden scope: env/dependency/schema/migration/staging/prod/cloud/deploy/real provider/destructive data operation remain blocked.
- Residual gaps: Browser plugin direct UI screenshot blocked by current runtime; Playwright e2e/build used as local fallback.

## Recovery

- branch: `codex/phase-20-fix-ra-06-04-org-auth-detail-route-alignment`
- base: `master`
- base HEAD at claim: `c9363ea70ab3ec81998cdc2698ecf475df19b7fa`
- task: `phase-20-fix-ra-06-04-org-auth-detail-route-alignment`

## Human Approval

User approved claiming this task and approved the required `auth_permission_model` and `api_contract` risks for local-only `org_auth` detail route/API DTO/UI alignment in this session. User also authorized task commit, merge into `master`, push `origin/master`, and short-lived branch cleanup after successful validation.

## Implementation Notes

- Added `OrgAuthDetailDto` and `OrgAuthDetailResultDto` with `publicId` references, covered organization detail, and quota occupancy summary.
- Added `GET /api/v1/org-auths/{publicId}` route through the existing route handler/service/repository layering.
- Added repository detail lookup using internal numeric ids only inside repository joins; returned DTOs expose public identifiers only.
- Kept server-side read authorization aligned with existing operations boundary: `super_admin` and `ops_admin` can read enterprise authorization details; `content_admin` receives `403601`.
- Updated the admin organization page so clicking `查看详情` calls the detail API and renders the returned detail payload.
- Updated adjacent UI tests that previously assumed detail was rendered from list data.

## Commands

| Command                                                                                                                                                                                                                                                                                             | Result   | Summary                                                                                                                                            |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `git fetch origin`                                                                                                                                                                                                                                                                                  | pass     | Refreshed remote state before claim.                                                                                                               |
| `git status --short --branch`                                                                                                                                                                                                                                                                       | pass     | `master` was clean and aligned before branch creation.                                                                                             |
| `git rev-list --left-right --count master...origin/master`                                                                                                                                                                                                                                          | pass     | Returned `0 0`.                                                                                                                                    |
| `git branch --list`                                                                                                                                                                                                                                                                                 | pass     | Only `master` existed before task branch creation.                                                                                                 |
| `git worktree list --porcelain`                                                                                                                                                                                                                                                                     | pass     | Only `D:/tiku` worktree registered.                                                                                                                |
| `git log -8 --oneline --decorate`                                                                                                                                                                                                                                                                   | pass     | Confirmed `c9363ea` HEAD and historical `4c3a98b`.                                                                                                 |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1`                                                                                                                                                                                      | pass     | Agent-system readiness passed.                                                                                                                     |
| `git switch -c codex/phase-20-fix-ra-06-04-org-auth-detail-route-alignment`                                                                                                                                                                                                                         | pass     | Created and switched to task branch.                                                                                                               |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-TaskClaimReadiness.ps1 -TaskId phase-20-fix-ra-06-04-org-auth-detail-route-alignment`                                                                                                                          | pass     | Claim readiness passed; YAML anchors were checked directly from the queue because the script reported allowed/blocked/validation as `none`.        |
| `npm.cmd run test:unit -- tests/unit/phase-20-ra-06-04-org-auth-detail-route-alignment.test.ts`                                                                                                                                                                                                     | red/pass | First run failed on missing `orgAuths.item.GET` and UI not calling detail API; after implementation, 1 file and 3 tests passed.                    |
| `npm.cmd run test:unit -- tests/unit/phase-11-system-ops-org-auth-management-loop.test.ts tests/unit/phase-11-system-ops-organization-management-loop.test.ts tests/unit/phase-20-ra-06-03-organization-employee-management-completion.test.ts tests/unit/phase-8-admin-org-auth-redeem-ui.test.ts` | pass     | Adjacent admin ops/UI coverage passed: 4 files, 16 tests.                                                                                          |
| `node .\node_modules\prettier\bin\prettier.cjs --write <touched task files>`                                                                                                                                                                                                                        | pass     | Formatted touched task files.                                                                                                                      |
| `npm.cmd run typecheck`                                                                                                                                                                                                                                                                             | pass     | TypeScript passed.                                                                                                                                 |
| `npm.cmd run lint`                                                                                                                                                                                                                                                                                  | pass     | ESLint passed.                                                                                                                                     |
| `npm.cmd run test:unit`                                                                                                                                                                                                                                                                             | pass     | Full unit suite passed: 139 files, 589 tests.                                                                                                      |
| `npm.cmd run test:e2e`                                                                                                                                                                                                                                                                              | pass     | Playwright e2e passed: 25 tests.                                                                                                                   |
| `npm.cmd run build`                                                                                                                                                                                                                                                                                 | pass     | Production build passed and listed `/api/v1/org-auths/[publicId]`. Framework output mentioned `.env.local` existence only; contents were not read. |
| Browser plugin local verification                                                                                                                                                                                                                                                                   | blocked  | Browser skill and `node_repl js` discovery were attempted; setup failed with `windows sandbox failed: spawn setup refresh`.                        |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1`                                                                                                                                                                                      | pass     | Agent-system readiness passed.                                                                                                                     |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`                                                                                                                                                                 | pass     | Completion readiness inventory passed before staging.                                                                                              |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1`                                                                                                                                                                                         | pass     | Naming convention gate passed.                                                                                                                     |
| `git diff --check`                                                                                                                                                                                                                                                                                  | pass     | No whitespace errors.                                                                                                                              |
| `npm.cmd run format:check`                                                                                                                                                                                                                                                                          | pass     | Prettier format check passed.                                                                                                                      |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-QualityGate.ps1`                                                                                                                                                                                             | pass     | Unified gate passed: lint, typecheck, full unit test, and format check.                                                                            |

## Browser Verification

The Browser plugin was selected for local UI verification. The Browser skill was read and tool discovery exposed `mcp__node_repl.js`; bootstrap against the `iab` backend failed with:

`node_repl kernel exited unexpectedly ... windows sandbox failed: spawn setup refresh`

Fallback verification used the repository's Playwright e2e suite, focused DOM unit test for the detail panel, production build, and local quality gates. This evidence does not claim an in-app Browser screenshot.

## Security Review

- Status: approved for local-only task branch completion.
- Task id: `phase-20-fix-ra-06-04-org-auth-detail-route-alignment`
- Branch: `codex/phase-20-fix-ra-06-04-org-auth-detail-route-alignment`
- Base: `master` at `c9363ea70ab3ec81998cdc2698ecf475df19b7fa`
- Reviewer: Codex local review
- Review date: 2026-05-31
- Risk types reviewed: `auth_permission_model`, `api_contract`, `admin_ops`, `local_human_verification`, `evidence_integrity`
- Files reviewed:
  - `src/app/api/v1/org-auths/[publicId]/route.ts`
  - `src/server/contracts/organization-auth-contract.ts`
  - `src/server/services/admin-organization-org-auth-runtime.ts`
  - `src/server/repositories/admin-organization-org-auth-runtime-repository.ts`
  - `src/features/admin/org-auth-redeem/AdminOrgAuthRedeemPage.tsx`
  - `tests/unit/phase-20-ra-06-04-org-auth-detail-route-alignment.test.ts`
  - `tests/unit/phase-20-ra-06-03-organization-employee-management-completion.test.ts`
- Abuse cases considered: non-admin or missing session access, `content_admin` attempting to read operations `org_auth` detail, numeric id leakage through URLs/DTOs, response envelope drift, and detail data leaking credentials/session internals.
- Authorization boundary review: detail read is enforced in server runtime via the existing readable enterprise auth role check; UI visibility is not the permission boundary.
- API contract review: route path uses `/api/v1/org-auths/{publicId}`; response remains `{ code, message, data, pagination? }`; JSON keys are camelCase; external references use `publicId`.
- Data exposure review: DTO does not expose numeric ids, secrets, tokens, password hashes, provider payloads, or session internals. Repository uses numeric ids only internally for joins.
- Test coverage: focused RED/GREEN service and UI tests cover envelope, role denial, detail API call, and publicId-only payload; adjacent admin ops tests, full unit, e2e, and build passed.
- Accepted gap: direct Browser screenshot was blocked by the browser runtime setup failure; Playwright e2e and focused DOM tests provide fallback local verification.

Verdict: APPROVE for task commit, merge to `master`, push, and short-lived branch cleanup under the user's approval.

## Git Closeout

Pending implementation commit, merge into `master`, post-merge validation, push, branch cleanup, and cleanup docs commit.
