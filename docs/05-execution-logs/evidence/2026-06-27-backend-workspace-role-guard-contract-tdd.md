# Backend Workspace Role Guard Contract TDD Evidence

Task id: `backend-workspace-role-guard-contract-tdd-2026-06-27`

Branch: `codex/backend-workspace-role-guard-contract-20260627`

Task kind: `implementation_tdd`

result: pass

resultDetail: pass_permission_contract_role_guard_focused_unit_static_gates_no_browser_no_final_pass

moduleRunVersion: 2

Batch range: permission contract for backend workspace route guard, capability summary, and direct-route allow/deny decisions.

Commit: `cfc16f44e81daa94fd229ab9ad1a42e6e97cd64b` baseline before this permission contract task; closeout commit SHA is reported in final handoff to avoid self-referential state churn.

localFullLoopGate: L2_focused_unit_plus_L1_static_no_browser

threadRolloverGate: no new thread required; resume from this evidence, the task plan, `project-state.yaml`, and `task-queue.yaml`.

nextModuleRunCandidate: `organization-admin-standard-advanced-workspace-source-contract-2026-06-27`

RED: Focused unit test failed before implementation because `admin-workspace-role-guard-service` did not exist.

GREEN: Focused unit test passed after adding the pure contract and service adapter; lint, typecheck, scoped Prettier, and diff check passed.

Cost Calibration Gate remains blocked pending fresh explicit approval.

## Summary

This task adds a pure backend workspace permission contract:

- direct-route workspace classification for `ops`, `content`, and `organization`;
- role-based denial for unrelated backend workspaces independent of menu visibility;
- organization advanced-only route decisions that require service-computed advanced organization capability input;
- standard-unavailable decision for organization advanced-only surfaces when effective organization capability is not advanced;
- no UI component, DB repository, Provider, browser, or runtime dependency.

## Changed Files

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `src/server/contracts/admin-workspace-role-guard-contract.ts`
- `src/server/services/admin-workspace-role-guard-service.ts`
- `tests/unit/admin-workspace-role-guard-contract.test.ts`
- `docs/05-execution-logs/task-plans/2026-06-27-backend-workspace-role-guard-contract-tdd.md`
- `docs/05-execution-logs/evidence/2026-06-27-backend-workspace-role-guard-contract-tdd.md`
- `docs/05-execution-logs/audits-reviews/2026-06-27-backend-workspace-role-guard-contract-tdd.md`
- `docs/05-execution-logs/acceptance/2026-06-27-backend-workspace-role-guard-contract-tdd.md`

## Approval Boundary

Current user approved permission/authorization contract task `backend-workspace-role-guard-contract-tdd-2026-06-27`. Allowed changes are limited to task-queue-listed route guard, capability contract, validator/mapper/service adapter, focused unit test, and task docs/evidence/audit/acceptance.

The task follows `docs/01-requirements/traceability/2026-06-27-standard-advanced-backend-ux-design-first-contract.md`.

## Requirement Mapping Result

- Backend workspace direct routes: `ops_admin`, `content_admin`, and organization admins are separated by service contract.
- Organization standard versus advanced: advanced-only organization paths require service-computed advanced capability input; standard summaries receive `standard_unavailable`.
- UI boundary: the new contract does not read menu visibility, component state, or client layout state.
- ADR-007: `effectiveEdition` remains calculated by existing authorization services; this guard only consumes the capability summary.

## RED

Command:

```powershell
npm.cmd run test:unit -- tests/unit/admin-workspace-role-guard-contract.test.ts
```

Result: failed as expected.

Expected failure category:

- Vite import analysis failed because `@/server/services/admin-workspace-role-guard-service` did not exist.

Observed aggregate: 1 test file failed; 0 tests executed.

## GREEN

Command:

```powershell
npm.cmd run test:unit -- tests/unit/admin-workspace-role-guard-contract.test.ts
```

Result: pass.

Summary: 1 test file passed; 3 tests passed.

## Validation

| Command                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     | Result                                                                                                                                                                                                                                      |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `npm.cmd run test:unit -- tests/unit/admin-workspace-role-guard-contract.test.ts`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | pass; 1 file, 3 tests                                                                                                                                                                                                                       |
| `npm.cmd run lint`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | pass; ESLint completed without findings                                                                                                                                                                                                     |
| `npm.cmd run typecheck`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     | pass; `tsc --noEmit` completed                                                                                                                                                                                                              |
| `npx.cmd prettier --write --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml src/server/contracts/admin-workspace-role-guard-contract.ts src/server/services/admin-workspace-role-guard-service.ts tests/unit/admin-workspace-role-guard-contract.test.ts docs/05-execution-logs/task-plans/2026-06-27-backend-workspace-role-guard-contract-tdd.md docs/05-execution-logs/evidence/2026-06-27-backend-workspace-role-guard-contract-tdd.md docs/05-execution-logs/audits-reviews/2026-06-27-backend-workspace-role-guard-contract-tdd.md docs/05-execution-logs/acceptance/2026-06-27-backend-workspace-role-guard-contract-tdd.md` | pass; scoped write completed                                                                                                                                                                                                                |
| `npx.cmd prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml src/server/contracts/admin-workspace-role-guard-contract.ts src/server/services/admin-workspace-role-guard-service.ts tests/unit/admin-workspace-role-guard-contract.test.ts docs/05-execution-logs/task-plans/2026-06-27-backend-workspace-role-guard-contract-tdd.md docs/05-execution-logs/evidence/2026-06-27-backend-workspace-role-guard-contract-tdd.md docs/05-execution-logs/audits-reviews/2026-06-27-backend-workspace-role-guard-contract-tdd.md docs/05-execution-logs/acceptance/2026-06-27-backend-workspace-role-guard-contract-tdd.md` | pass; all matched files use Prettier code style                                                                                                                                                                                             |
| `git diff --check`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | pass; no whitespace errors                                                                                                                                                                                                                  |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-TikuProjectStatus.ps1`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | pass after status closeout; `nextActionDecision: no_pending_task`, `activeQueueNonTerminalCount: 3`, `archiveCandidateCount: 6`, `highRiskRepairBlockedCount: 0`, `projectStatusRequiresHuman: true`; Cost Calibration Gate remains blocked |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId backend-workspace-role-guard-contract-tdd-2026-06-27`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        | pass; 9 task-scoped files scanned and allowed scope matched                                                                                                                                                                                 |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId backend-workspace-role-guard-contract-tdd-2026-06-27`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | pass after evidence anchor repair                                                                                                                                                                                                           |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId backend-workspace-role-guard-contract-tdd-2026-06-27 -SkipRemoteAheadCheck`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | pass; branch, master, origin/master, state master, and state origin master aligned at `cfc16f44e81daa94fd229ab9ad1a42e6e97cd64b`                                                                                                            |

## Forbidden-Action Checklist

| Action                                                  | Result           |
| ------------------------------------------------------- | ---------------- |
| Schema/migration/seed touched                           | pass_not_touched |
| Package or lockfile changed                             | pass_not_touched |
| `.env*` read or changed                                 | pass_not_touched |
| Browser/dev-server/e2e run                              | pass_not_run     |
| DB connection or mutation                               | pass_not_run     |
| Provider call/configuration                             | pass_not_run     |
| Cost Calibration execution                              | pass_not_run     |
| Staging/prod/deploy/payment/OCR/export/external service | pass_not_run     |
| PR or force push                                        | pass_not_done    |
| Release readiness or final Pass claimed                 | pass_not_claimed |

## Repository Hygiene Checklist

| Check                | Required evidence                                                                                                                                                                          | Result  |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------- |
| Branch isolation     | Current branch is `codex/backend-workspace-role-guard-contract-20260627`, not `master` or `main` during implementation                                                                     | pass    |
| Allowed files        | Changed file list matches queue `allowedFiles` and avoids `blockedFiles`                                                                                                                   | pass    |
| AC-to-runtime matrix | Permission contract only; browser/runtime acceptance remains deferred                                                                                                                      | pass    |
| Problem grading      | P1/P2 authorization contract gap fixed at pure source contract level; runtime integration remains future scope                                                                             | pass    |
| Validation record    | Focused unit, lint, typecheck, formatting, diff, project status, and Module Run v2 gates recorded                                                                                          | pass    |
| Evidence hygiene     | No secret, token, Authorization header, raw provider payload, raw prompt, raw answer, raw model response, full paper/material/OCR text, generated plaintext `redeem_code`, or private data | pass    |
| Commit               | Focused task commit SHA recorded after commit                                                                                                                                              | pending |
| Merge                | Merge target and result recorded after approved closeout                                                                                                                                   | pending |
| Push                 | Remote, branch, and push result recorded after approved closeout                                                                                                                           | pending |
| Cleanup              | Merged short-lifecycle branch deletion recorded after approved closeout                                                                                                                    | pending |
| Worktree residue     | Final status checked before handoff                                                                                                                                                        | pending |
| stagingDecision      | `blocked_not_in_scope_no_target`                                                                                                                                                           | pass    |
| Next step            | `organization-admin-standard-advanced-workspace-source-contract-2026-06-27`                                                                                                                | pass    |

## Blocked Remainder

- Browser validation remains blocked by current task scope and requires a separately approved local browser task.
- Actual route handler/layout integration beyond the pure contract remains future source work if product chooses to wire this guard into runtime pages.
- DB/schema/migration/seed work remains blocked.
- Provider, Provider configuration, and Cost Calibration remain blocked.
- Staging/prod/deploy, payment, OCR/export, external-service work, PR, force push, release readiness, and final Pass remain blocked.

## Redaction Statement

Evidence records only public task ids, file paths, command names, pass/fail status, and aggregate test counts. It contains no secret, token, Authorization header, database URL, Provider payload, prompt, raw AI output, employee subjective answer text, full `paper` content, DB rows, or plaintext `redeem_code`.
