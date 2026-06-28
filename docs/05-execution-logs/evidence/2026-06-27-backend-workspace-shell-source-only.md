# Backend Workspace Shell Source-Only Evidence

Task id: `backend-workspace-shell-source-only-2026-06-27`

Branch: `codex/backend-workspace-shell-source-20260627`

Task kind: `implementation_tdd`

result: pass

resultDetail: pass_source_only_backend_workspace_shell_focused_unit_static_gates_no_browser_no_final_pass

moduleRunVersion: 2

Batch range: source-only backend workspace shell, workspace switcher, visible logout preservation, and reusable unavailable state slice.

Commit: `f5cc8c4de804539b13eb6945d51bf6a4a86756ec` baseline before this source-only task; closeout commit SHA is reported in final handoff to avoid self-referential state churn.

localFullLoopGate: L2_focused_unit_plus_L1_static_no_browser

threadRolloverGate: no new thread required; resume from this evidence, the task plan, `project-state.yaml`, and `task-queue.yaml`.

nextModuleRunCandidate: content-ops-organization-nav-entry-source-only-2026-06-27

RED: Focused unit tests failed before implementation because the reusable upgrade-required state was missing and the backend shell had no explicit workspace switcher.

GREEN: Focused unit tests passed after source-only shell/state implementation; lint, typecheck, scoped Prettier, and diff check passed.

Cost Calibration Gate remains blocked pending fresh explicit approval.

## Summary

This source-only UI task implements the first backend workspace shell slice from the 2026-06-27 backend UX contract:

- explicit workspace switcher for multi-role backend admins;
- preserved role-scoped operations, content, and organization navigation;
- visible logout remains present in authorized backend workspaces;
- reusable standard-unavailable state for advanced-only backend surfaces.

No browser, dev server, e2e, DB, Provider, Cost Calibration, staging/prod/deploy, payment, OCR, export, external-service, PR, force-push, release readiness, or final Pass work was performed.

## Changed Files

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `src/components/AdminDashboardLayout/AdminDashboardLayout.tsx`
- `src/features/admin/content-admin-runtime.tsx`
- `tests/unit/admin-dashboard-layout-navigation.test.ts`
- `tests/unit/admin-common-ux-state-audit.test.ts`
- `docs/05-execution-logs/task-plans/2026-06-27-backend-workspace-shell-source-only.md`
- `docs/05-execution-logs/evidence/2026-06-27-backend-workspace-shell-source-only.md`
- `docs/05-execution-logs/audits-reviews/2026-06-27-backend-workspace-shell-source-only.md`
- `docs/05-execution-logs/acceptance/2026-06-27-backend-workspace-shell-source-only.md`

## Approval Boundary

Current user approved low-risk source-only UI task `backend-workspace-shell-source-only-2026-06-27`. Allowed changes are limited to task-queue-listed backend shell/navigation/state component source files, necessary focused unit tests, and task docs/evidence/audit/acceptance.

The task follows `docs/01-requirements/traceability/2026-06-27-standard-advanced-backend-ux-design-first-contract.md`.

## Requirement Mapping Result

- R1 backend workspace separation: partially addressed at source-only shell level by explicit workspace switcher and role-scoped shell navigation.
- Organization admin first-class workspace: preserved by keeping organization destinations under `/organization/*` and not merging organization admins into operations menus.
- Advanced-only organization entries: still filtered by existing role summary in the shell; direct route/service enforcement remains deferred to permission contract tasks.
- State contract: reusable standard-unavailable state added for advanced-only surfaces that standard organization admins cannot use.
- Authorization boundary: unchanged. UI visibility remains advisory only, and `effectiveEdition` computation remains a service-layer concern under ADR-007.

## RED

Command:

```powershell
npm.cmd run test:unit -- tests/unit/admin-dashboard-layout-navigation.test.ts tests/unit/admin-common-ux-state-audit.test.ts
```

Result: failed as expected.

Expected failure categories:

- `AdminUpgradeRequiredState` was not exported from `content-admin-runtime.tsx`.
- `AdminDashboardLayout` did not expose a `后台工作区切换` navigation region for multi-role backend admins.

## GREEN

Command:

```powershell
npm.cmd run test:unit -- tests/unit/admin-dashboard-layout-navigation.test.ts tests/unit/admin-common-ux-state-audit.test.ts
```

Result: pass.

Summary: 2 test files passed; 13 tests passed.

## Validation

| Command                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | Result                                                                                                                                                                                                                                                      |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `npm.cmd run test:unit -- tests/unit/admin-dashboard-layout-navigation.test.ts tests/unit/admin-common-ux-state-audit.test.ts`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | pass; 2 files, 13 tests                                                                                                                                                                                                                                     |
| `npm.cmd run lint`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | pass; ESLint completed without findings                                                                                                                                                                                                                     |
| `npm.cmd run typecheck`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | pass; `tsc --noEmit` completed                                                                                                                                                                                                                              |
| `npx.cmd prettier --write --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml src/components/AdminDashboardLayout/AdminDashboardLayout.tsx src/features/admin/content-admin-runtime.tsx tests/unit/admin-dashboard-layout-navigation.test.ts tests/unit/admin-common-ux-state-audit.test.ts docs/05-execution-logs/task-plans/2026-06-27-backend-workspace-shell-source-only.md docs/05-execution-logs/evidence/2026-06-27-backend-workspace-shell-source-only.md docs/05-execution-logs/audits-reviews/2026-06-27-backend-workspace-shell-source-only.md docs/05-execution-logs/acceptance/2026-06-27-backend-workspace-shell-source-only.md` | pass; scoped write completed                                                                                                                                                                                                                                |
| `npx.cmd prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml src/components/AdminDashboardLayout/AdminDashboardLayout.tsx src/features/admin/content-admin-runtime.tsx tests/unit/admin-dashboard-layout-navigation.test.ts tests/unit/admin-common-ux-state-audit.test.ts docs/05-execution-logs/task-plans/2026-06-27-backend-workspace-shell-source-only.md docs/05-execution-logs/evidence/2026-06-27-backend-workspace-shell-source-only.md docs/05-execution-logs/audits-reviews/2026-06-27-backend-workspace-shell-source-only.md docs/05-execution-logs/acceptance/2026-06-27-backend-workspace-shell-source-only.md` | pass; all matched files use Prettier code style                                                                                                                                                                                                             |
| `git diff --check`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | pass; no whitespace errors                                                                                                                                                                                                                                  |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-TikuProjectStatus.ps1`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | pass diagnostic after task status closeout; `nextActionDecision: no_pending_task`, `activeQueueNonTerminalCount: 3`, `archiveCandidateCount: 4`, `highRiskRepairBlockedCount: 0`, `projectStatusRequiresHuman: true`; Cost Calibration Gate remains blocked |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId backend-workspace-shell-source-only-2026-06-27`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | pass; pre-commit hardening scanned 10 task-scoped files and passed                                                                                                                                                                                          |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId backend-workspace-shell-source-only-2026-06-27`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | pass after evidence anchor repair; module-closeout readiness passed                                                                                                                                                                                         |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId backend-workspace-shell-source-only-2026-06-27 -SkipRemoteAheadCheck`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | pass; pre-push readiness passed with `master`, `origin/master`, state master, and state origin master aligned at `f5cc8c4de804539b13eb6945d51bf6a4a86756ec`                                                                                                 |

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

## Redaction Statement

Evidence records only public task ids, file paths, command names, pass/fail status, and aggregate test counts. It contains no secret, token, Authorization header, database URL, Provider payload, prompt, raw AI output, employee subjective answer text, full `paper` content, DB rows, or plaintext `redeem_code`.

## Residual Gaps

- Permission/authorization contract remains deferred to `backend-workspace-role-guard-contract-tdd-2026-06-27`.
- Browser validation remains blocked by current task scope and should use a separately approved local browser task.
- DB/schema, Provider/Cost, staging/prod/deploy, payment/export/OCR, release readiness, and final Pass remain blocked.
