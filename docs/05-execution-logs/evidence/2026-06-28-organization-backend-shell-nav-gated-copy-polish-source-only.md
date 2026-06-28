# Organization Backend Shell Nav Gated Copy Polish Source-Only Evidence

Task id: `organization-backend-shell-nav-gated-copy-polish-source-only-2026-06-28`

Branch: `codex/organization-backend-shell-nav-gated-copy-polish-20260628`

Task kind: `implementation_tdd`

result: pass

resultDetail: pass_source_only_shell_nav_gated_copy_polish_no_browser_no_final_pass

moduleRunVersion: 2

Approval source: current user batch approval on 2026-06-28 for serial local low-risk UX polish tasks and per-task local commit, fast-forward merge, push, and cleanup. PR and force push remain blocked.

Cost Calibration Gate remains blocked pending fresh explicit approval.

## Summary

This source-only UI task polishes the organization backend shell/navigation slice:

- advanced organization admins now see a grouped `高级组织能力` cluster for organization training, analytics, and AI generation entries;
- standard organization admins now see safe standard-edition guidance and a return action without receiving advanced-only menu links;
- direct-route denied backend states now show a role-appropriate return action for organization, content, or operations admins.

No browser, dev server, e2e, DB, Provider, Cost Calibration, staging/prod/deploy, payment, OCR, export, external-service, PR, force push, release readiness, or final Pass work was performed.

## Changed Files

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `src/components/AdminDashboardLayout/AdminDashboardLayout.tsx`
- `tests/unit/admin-dashboard-layout-navigation.test.ts`
- `docs/05-execution-logs/task-plans/2026-06-28-organization-backend-shell-nav-gated-copy-polish-source-only.md`
- `docs/05-execution-logs/evidence/2026-06-28-organization-backend-shell-nav-gated-copy-polish-source-only.md`
- `docs/05-execution-logs/audits-reviews/2026-06-28-organization-backend-shell-nav-gated-copy-polish-source-only.md`
- `docs/05-execution-logs/acceptance/2026-06-28-organization-backend-shell-nav-gated-copy-polish-source-only.md`

`src/features/admin/content-admin-runtime.tsx` and `tests/unit/admin-common-ux-state-audit.test.ts` were within allowed validation scope but did not require source changes.

## Approval Boundary

The current user approved this low-risk source-only UI task as part of the serial batch. Allowed changes were limited to task-queue-listed shell/navigation/gated copy source, focused unit tests, task docs/state/evidence/audit/acceptance, and task-scoped local closeout. The task was not allowed to change schema/migration/seed, package/lockfile, `.env*`, DB, Provider, Cost Calibration, staging/prod/deploy, payment/OCR/export/external-service, browser/e2e, PR, force push, release readiness, or final Pass.

## Requirement Mapping Result

- UX-P1 shell/navigation: addressed at source-only level by grouping advanced organization entries and adding standard organization guidance in the shell.
- Role-separated backend workspaces: preserved by keeping role-specific operations, content, and organization return actions distinct.
- ADR-007 authorization source of truth: preserved. UI copy and menu visibility remain advisory, while advanced availability still consumes `getAdminWorkspaceCapabilitySummary` and `canUseOrganizationAdvancedWorkspaceCapability`.
- Standard organization admin expectation: advanced-only navigation links remain hidden, while the shell explains the standard-unavailable path without exposing advanced controls.
- Advanced organization admin expectation: training, analytics, and organization AI entries remain discoverable as an advanced capability cluster.

## RED

Command:

```powershell
npm.cmd run test:unit -- tests/unit/admin-dashboard-layout-navigation.test.ts tests/unit/admin-common-ux-state-audit.test.ts
```

Result: failed as expected.

Expected failure categories:

- missing `高级组织能力` grouping label for advanced organization admins;
- missing `标准版组织后台` guidance and `返回组织概览` action for standard organization admins;
- missing role-appropriate `返回内容后台` and `返回组织后台` actions in forbidden direct-route states.

Summary: 2 test files ran; 4 expected failures in `admin-dashboard-layout-navigation.test.ts`; existing common UX state audit tests passed.

## GREEN

Command:

```powershell
npm.cmd run test:unit -- tests/unit/admin-dashboard-layout-navigation.test.ts tests/unit/admin-common-ux-state-audit.test.ts
```

Result: pass.

Summary: 2 test files passed; 13 tests passed.

## Validation

| Command                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | Result                                                                                                                                                                                                                                                                                           |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `npm.cmd run test:unit -- tests/unit/admin-dashboard-layout-navigation.test.ts tests/unit/admin-common-ux-state-audit.test.ts`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | pass; 2 files, 13 tests                                                                                                                                                                                                                                                                          |
| `npm.cmd run lint`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | pass; ESLint completed without findings                                                                                                                                                                                                                                                          |
| `npm.cmd run typecheck`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | pass; `tsc --noEmit` completed                                                                                                                                                                                                                                                                   |
| `npx.cmd prettier --write --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml src/components/AdminDashboardLayout/AdminDashboardLayout.tsx src/features/admin/content-admin-runtime.tsx tests/unit/admin-dashboard-layout-navigation.test.ts tests/unit/admin-common-ux-state-audit.test.ts docs/05-execution-logs/task-plans/2026-06-28-organization-backend-shell-nav-gated-copy-polish-source-only.md docs/05-execution-logs/evidence/2026-06-28-organization-backend-shell-nav-gated-copy-polish-source-only.md docs/05-execution-logs/audits-reviews/2026-06-28-organization-backend-shell-nav-gated-copy-polish-source-only.md docs/05-execution-logs/acceptance/2026-06-28-organization-backend-shell-nav-gated-copy-polish-source-only.md` | pass; scoped write completed                                                                                                                                                                                                                                                                     |
| `npx.cmd prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml src/components/AdminDashboardLayout/AdminDashboardLayout.tsx src/features/admin/content-admin-runtime.tsx tests/unit/admin-dashboard-layout-navigation.test.ts tests/unit/admin-common-ux-state-audit.test.ts docs/05-execution-logs/task-plans/2026-06-28-organization-backend-shell-nav-gated-copy-polish-source-only.md docs/05-execution-logs/evidence/2026-06-28-organization-backend-shell-nav-gated-copy-polish-source-only.md docs/05-execution-logs/audits-reviews/2026-06-28-organization-backend-shell-nav-gated-copy-polish-source-only.md docs/05-execution-logs/acceptance/2026-06-28-organization-backend-shell-nav-gated-copy-polish-source-only.md` | pass; all matched files use Prettier style                                                                                                                                                                                                                                                       |
| `git diff --check`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | pass; no whitespace errors                                                                                                                                                                                                                                                                       |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-TikuProjectStatus.ps1`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               | pass diagnostic after closed state update; `nextActionDecision: no_pending_task`, `activeQueueNonTerminalCount: 6`, `archiveCandidateCount: 14`, `highRiskRepairBlockedCount: 0`, `projectStatusRequiresHuman: true`, `projectStatusSafeToProceed: false`; Cost Calibration Gate remains blocked |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId organization-backend-shell-nav-gated-copy-polish-source-only-2026-06-28`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | pass; hard-block mode scanned 8 task-scoped files                                                                                                                                                                                                                                                |

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

Evidence records only public task ids, file paths, command names, pass/fail status, expected failure categories, and aggregate test counts. It contains no secret, token, cookie, localStorage value, Authorization header, database URL, DB row, Provider payload, prompt, raw AI output, employee subjective answer text, full `question` or `paper` content, raw DOM, screenshot, trace, or plaintext `redeem_code`.

## Residual Gaps

- Page-level portal/training/analytics/AI generation state polish remains queued for `organization-workspace-page-states-polish-source-only-2026-06-28`.
- Permission/authorization contract hardening remains queued for `organization-workspace-ux-polish-permission-contract-tdd-2026-06-28`.
- Local browser validation remains deferred until the first three tasks are verified.
- DB/schema, Provider/Cost, staging/prod/deploy, payment/export/OCR, release readiness, and final Pass remain blocked.
