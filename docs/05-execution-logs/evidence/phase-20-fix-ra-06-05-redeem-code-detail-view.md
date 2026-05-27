# Phase 20 Fix RA-06-05 Redeem Code Detail View Evidence

**Task id:** `phase-20-fix-ra-06-05-redeem-code-detail-view`

**Branch:** `codex/phase-20-fix-ra-06-05-redeem-code-detail-view`

## Summary

- Result: pass.
- Scope: implementation.
- Changed surfaces: admin `redeem_code` UI detail panel, focused unit test, local business-flow e2e detail assertion, task plan/evidence, queue/state.
- Gates: claim readiness, lint, typecheck, test:unit, test:e2e, build, readiness, git inventory, diff check, changed-file Prettier, naming, and quality gate passed.
- Forbidden scope (`forbiddenScope`): no env/dependency/schema/migration/staging/prod/cloud/deploy/real provider/destructive data operation.
- Residual gaps (`residualGaps`): Browser plugin runtime failed to connect under Windows sandbox; Playwright e2e was used as the recorded browser fallback.

## Startup Recovery

- Started from `master` with clean worktree.
- Ran `git fetch origin`; `master...origin/master` was `0 0`.
- `git status --short --branch` reported `## master...origin/master`.
- Only registered worktree was `D:/tiku`.
- No unmerged short-lived branches were found.
- `.worktrees/` had no residual directories.
- `project-state.yaml` pointed to closed Phase 21 and had stale repository SHAs `fcd883e`; Git reality was `c0210e7` on both `master` and `origin/master`.
- User explicitly instructed continuation into automation mode, so this task claims the next eligible 22-A low-risk Phase 20 task.

## Finding

- `F-RA-06-05-001` says dedicated `redeem_code` detail view evidence is incomplete.
- Existing evidence already covers batch generation, UTC+8 deadline normalization, filters, plaintext response for generated codes, and redacted audit logs.

## Claim Readiness

| Command                                                                                                                                                            | Result | Notes                                                                                                                                                                        |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-TaskClaimReadiness.ps1 -TaskId phase-20-fix-ra-06-05-redeem-code-detail-view` | pass   | The script reported allowed files and validation commands as `none` because the queue entry uses YAML anchors; actual anchor scope was read directly from `task-queue.yaml`. |

## Implementation Notes

- Added a `redeem_code` detail panel on `/ops/redeem-codes` using existing `RedeemCodeListDto` fields.
- Added a per-row `详情` action keyed by `publicId`; the panel carries `data-public-id` and no `data-id`.
- Detail panel shows masked `codeDisplay`, public identifier, status, `profession`/`level`, redeemed user public reference or `未兑换`, deadline, created time, and redaction status.
- The panel does not expose numeric ids, `code_hash`, or plaintext values from historical list responses.
- Added unit coverage for opening/closing the detail panel and redaction assertions.
- Added local business-flow e2e assertions that open the detail view when a `redeem_code` row exists and verify public-id/redaction behavior.

## Command Results

| Command                                                                                                                             | Result           | Notes                                                                                                                                                                                                                                                                                          |
| ----------------------------------------------------------------------------------------------------------------------------------- | ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `npm.cmd run test:unit -- admin-user-org-auth-ops-baseline.test.ts`                                                                 | pass             | Focused test file passed: 1 file, 12 tests.                                                                                                                                                                                                                                                    |
| `node .\node_modules\prettier\bin\prettier.cjs --write ...changed files...`                                                         | pass             | Initial sandbox run failed with EPERM reading local `node_modules`; escalated run formatted changed files.                                                                                                                                                                                     |
| `npm.cmd run test:unit`                                                                                                             | pass             | 131 files, 529 tests.                                                                                                                                                                                                                                                                          |
| `npm.cmd run typecheck`                                                                                                             | pass             | Initial sandbox run failed with EPERM reading local `node_modules`; escalated run passed.                                                                                                                                                                                                      |
| `npm.cmd run lint`                                                                                                                  | pass             | Initial sandbox run failed with EPERM reading local `node_modules`; escalated run passed.                                                                                                                                                                                                      |
| `npm.cmd run build`                                                                                                                 | pass             | Next.js build passed. Output noted `.env.local` was loaded by framework; file contents were not opened or copied.                                                                                                                                                                              |
| `npm.cmd run test:e2e`                                                                                                              | pass after retry | First full run: 24/25 passed, `local-business-flow` failed before the new `redeem_code` detail step with `409311 Mock exam is not in progress`. Root-cause check showed the failure was not introduced by this task; isolated `local-business-flow` passed, then full `test:e2e` passed 25/25. |
| `npm.cmd run test:e2e -- e2e/local-business-flow.spec.ts`                                                                           | pass             | Isolated reproduction of the failed spec passed: 1/1.                                                                                                                                                                                                                                          |
| Browser plugin via `node_repl` / `iab`                                                                                              | fallback used    | Browser setup was attempted twice and failed with `windows sandbox failed: spawn setup refresh`; Playwright e2e is the browser fallback evidence.                                                                                                                                              |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1`                      | pass             | Required files, scripts, skills, and anchors reported OK.                                                                                                                                                                                                                                      |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master` | pass             | Inventory showed only task-scoped modified/untracked files before staging.                                                                                                                                                                                                                     |
| `git diff --check`                                                                                                                  | pass             | No whitespace errors.                                                                                                                                                                                                                                                                          |
| `node .\node_modules\prettier\bin\prettier.cjs --check ...changed files...`                                                         | pass             | Escalated because local `node_modules` reads fail in sandbox.                                                                                                                                                                                                                                  |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1`                         | pass             | Naming convention scan completed.                                                                                                                                                                                                                                                              |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-QualityGate.ps1`                             | pass             | Ran lint, typecheck, test:unit (131 files, 529 tests), and format:check.                                                                                                                                                                                                                       |

## Closeout Status

- branch: `codex/phase-20-fix-ra-06-05-redeem-code-detail-view`
- base: `master` / `origin/master` at `c0210e7`
- changed files:
  - `docs/04-agent-system/state/project-state.yaml`
  - `docs/04-agent-system/state/task-queue.yaml`
  - `docs/05-execution-logs/task-plans/2026-05-27-phase-20-fix-ra-06-05-redeem-code-detail-view.md`
  - `docs/05-execution-logs/evidence/phase-20-fix-ra-06-05-redeem-code-detail-view.md`
  - `src/features/admin/org-auth-redeem/AdminOrgAuthRedeemPage.tsx`
  - `tests/unit/admin-user-org-auth-ops-baseline.test.ts`
  - `e2e/local-business-flow.spec.ts`
- commit: pending.
- merge: pending.
- push: pending.
- cleanup: pending.
