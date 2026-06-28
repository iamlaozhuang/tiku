# Organization Workspace UX Polish Permission Contract TDD Evidence

Task id: `organization-workspace-ux-polish-permission-contract-tdd-2026-06-28`

Branch: `codex/organization-workspace-permission-contract-polish-20260628`

Task kind: `implementation_tdd`

result: pass

resultDetail: pass_permission_contract_tdd_no_browser_no_db_no_provider_no_final_pass

moduleRunVersion: 2

Approval source: current user batch approval on 2026-06-28 for serial local low-risk UX polish tasks and per-task local commit, fast-forward merge, push, and cleanup. PR and force push remain blocked.

Cost Calibration Gate remains blocked pending fresh explicit approval.

## Summary

This permission-contract task tightens organization advanced workspace access after shell and page-state polish:

- advanced organization routes now require a verified `service_computed` capability summary;
- advanced organization routes now require `organizationAuthorizationSource = "org_auth"`;
- `session_fallback` summaries cannot enable advanced organization menu entries or route access even when local fields look advanced;
- standard `org_auth` advanced-route access remains `standard_unavailable`;
- missing organization context remains denied before any advanced capability fallback.

No browser, dev server, e2e, DB, Provider, Cost Calibration, staging/prod/deploy, payment, OCR, export, external-service, PR, force push, release readiness, or final Pass work was performed.

## Changed Files

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `src/server/contracts/admin-workspace-role-guard-contract.ts`
- `src/server/services/admin-workspace-role-guard-service.ts`
- `src/features/admin/organization-workspace/admin-organization-workspace-access.ts`
- `tests/unit/admin-workspace-role-guard-contract.test.ts`
- `tests/unit/organization-admin-standard-advanced-workspace-source-contract.test.ts`
- `tests/unit/admin-dashboard-layout-navigation.test.ts`
- `docs/05-execution-logs/task-plans/2026-06-28-organization-workspace-ux-polish-permission-contract-tdd.md`
- `docs/05-execution-logs/evidence/2026-06-28-organization-workspace-ux-polish-permission-contract-tdd.md`
- `docs/05-execution-logs/audits-reviews/2026-06-28-organization-workspace-ux-polish-permission-contract-tdd.md`
- `docs/05-execution-logs/acceptance/2026-06-28-organization-workspace-ux-polish-permission-contract-tdd.md`

`src/server/contracts/auth-contract.ts` and `src/server/mappers/auth-mapper.ts` were within allowed validation scope but did not require changes.

## Approval Boundary

The current user approved this permission-contract TDD task as part of the serial batch. Allowed changes were limited to task-queue-listed contract, service, mapper/access adapter, focused unit tests, task docs/state/evidence/audit/acceptance, and task-scoped local closeout. The task was not allowed to change schema/migration/seed, package/lockfile, `.env*`, DB, Provider, Cost Calibration, staging/prod/deploy, payment/OCR/export/external-service, browser/e2e, PR, force push, release readiness, or final Pass.

## Requirement Mapping Result

- ADR-007 authorization source of truth: preserved. Advanced organization capability now requires a service-computed `org_auth` capability summary instead of UI/session fallback.
- Organization training: standard and unverified contexts cannot reach advanced training through direct URL or menu visibility.
- Organization analytics: advanced summary routes require verified advanced organization capability; export and raw answer gates remain blocked.
- Organization AI generation: advanced entries remain gated by service capability and do not imply Provider, prompt, raw output, or formal `question`/`paper` adoption readiness.

## RED

Command:

```powershell
npm.cmd run test:unit -- tests/unit/admin-workspace-role-guard-contract.test.ts tests/unit/organization-admin-standard-advanced-workspace-source-contract.test.ts tests/unit/admin-dashboard-layout-navigation.test.ts
```

Result: failed as expected.

Expected failure categories:

- advanced organization routes allowed `session_fallback` capability summaries;
- advanced organization routes allowed summaries missing `org_auth` source;
- organization layout rendered advanced entries when the local session payload looked advanced but was not service-computed.

Summary: 3 test files ran; 3 expected failures; 19 tests passed.

## GREEN

Command:

```powershell
npm.cmd run test:unit -- tests/unit/admin-workspace-role-guard-contract.test.ts tests/unit/organization-admin-standard-advanced-workspace-source-contract.test.ts tests/unit/admin-dashboard-layout-navigation.test.ts
```

Result: pass.

Summary: 3 test files passed; 22 tests passed.

## Validation

| Command                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 | Result                                                                                       |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| `npm.cmd run test:unit -- tests/unit/admin-workspace-role-guard-contract.test.ts tests/unit/organization-admin-standard-advanced-workspace-source-contract.test.ts tests/unit/admin-dashboard-layout-navigation.test.ts`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                | pass; 3 files, 22 tests                                                                      |
| `npm.cmd run lint`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | pass; ESLint completed without findings                                                      |
| `npm.cmd run typecheck`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 | pass; `tsc --noEmit` completed                                                               |
| `npx.cmd prettier --write --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml src/server/contracts/admin-workspace-role-guard-contract.ts src/server/services/admin-workspace-role-guard-service.ts src/features/admin/organization-workspace/admin-organization-workspace-access.ts src/server/contracts/auth-contract.ts src/server/mappers/auth-mapper.ts tests/unit/admin-workspace-role-guard-contract.test.ts tests/unit/organization-admin-standard-advanced-workspace-source-contract.test.ts tests/unit/admin-dashboard-layout-navigation.test.ts docs/05-execution-logs/task-plans/2026-06-28-organization-workspace-ux-polish-permission-contract-tdd.md docs/05-execution-logs/evidence/2026-06-28-organization-workspace-ux-polish-permission-contract-tdd.md docs/05-execution-logs/audits-reviews/2026-06-28-organization-workspace-ux-polish-permission-contract-tdd.md docs/05-execution-logs/acceptance/2026-06-28-organization-workspace-ux-polish-permission-contract-tdd.md` | pass; scoped files formatted/checkable                                                       |
| `npx.cmd prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml src/server/contracts/admin-workspace-role-guard-contract.ts src/server/services/admin-workspace-role-guard-service.ts src/features/admin/organization-workspace/admin-organization-workspace-access.ts src/server/contracts/auth-contract.ts src/server/mappers/auth-mapper.ts tests/unit/admin-workspace-role-guard-contract.test.ts tests/unit/organization-admin-standard-advanced-workspace-source-contract.test.ts tests/unit/admin-dashboard-layout-navigation.test.ts docs/05-execution-logs/task-plans/2026-06-28-organization-workspace-ux-polish-permission-contract-tdd.md docs/05-execution-logs/evidence/2026-06-28-organization-workspace-ux-polish-permission-contract-tdd.md docs/05-execution-logs/audits-reviews/2026-06-28-organization-workspace-ux-polish-permission-contract-tdd.md docs/05-execution-logs/acceptance/2026-06-28-organization-workspace-ux-polish-permission-contract-tdd.md` | pass; all matched files use Prettier                                                         |
| `git diff --check`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | pass                                                                                         |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-TikuProjectStatus.ps1`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | pass; no pending task; active nonterminal 4; archive candidates 16; Cost Calibration blocked |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId organization-workspace-ux-polish-permission-contract-tdd-2026-06-28`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     | pass                                                                                         |

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

- This task does not prove DB-backed `org_auth`, `auth_upgrade`, or atomic scope computation.
- Local browser validation remains deferred until the first three tasks are verified and closed.
- DB/schema, Provider/Cost, staging/prod/deploy, payment/export/OCR, release readiness, and final Pass remain blocked.
