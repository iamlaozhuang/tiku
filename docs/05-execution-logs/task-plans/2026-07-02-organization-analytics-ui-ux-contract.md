# 2026-07-02 Organization Analytics UI/UX Contract Task Plan

## Task

Create package 3 of the serial UI/UX requirement contracts: organization analytics.

## Scope

Docs-only requirement and UI/UX contract work for organization overview, training detail, employee summary, formal
learning separation, weak-point analytics, privacy boundaries, and no enterprise AI quota consumption summary.

No product source, tests, schema, migration, database, Provider, browser/runtime, dependency, deploy, Cost Calibration,
release readiness, final Pass, or production usability work is allowed.

## Branch

`codex/organization-analytics-uiux-contract-2026-07-02`

## Required Reading

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/03-standards/ui-code.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/02-architecture/adr/adr-007-edition-aware-authorization-source-of-truth.md`
- `docs/01-requirements/advanced-edition/modules/05-organization-analytics.md`
- `docs/01-requirements/advanced-edition/stories/epic-03-employee-answer-statistics.md`
- `docs/01-requirements/traceability/2026-07-02-role-auth-training-ops-decision-package.md`
- `docs/01-requirements/traceability/2026-07-02-current-thread-requirement-reconciliation-ledger.md`
- `docs/01-requirements/traceability/2026-07-02-ui-ux-requirement-design-baseline-gap-analysis.md`

## Source Inspection

Read-only source inspection targets:

- `src/features/admin/organization-analytics/AdminOrganizationAnalyticsPage.tsx`
- `src/features/admin/organization-portal/AdminOrganizationPortalPage.tsx`
- `src/features/admin/organization-workspace/admin-organization-workspace-access.ts`
- `src/server/contracts/organization-analytics-contract.ts`
- `src/server/services/organization-analytics-service.ts`
- `src/server/services/organization-analytics-route.ts`
- `src/server/repositories/organization-analytics-repository.ts`
- `src/server/validators/organization-analytics.ts`
- `src/app/(admin)/organization/organization-analytics/page.tsx`
- `src/app/(admin)/content/organization-analytics/page.tsx`
- `src/app/api/v1/organization-analytics/**`

## Implementation Plan

1. Reconcile existing organization analytics decisions from advanced requirements and current-thread traceability.
2. Inspect current source for route, access, DTO, service, repository, UI, and route alias reality.
3. Write a docs-only UI/UX contract that separates:
   - existing decisions;
   - current source alignment;
   - implementation gaps;
   - decision items.
4. Write redacted evidence with command summaries only.
5. Record two self-review passes.
6. Update `project-state.yaml` and `task-queue.yaml` for the package.
7. Run formatting and Module Run v2 gates.
8. Commit, fast-forward merge to `master`, push `origin/master`, and delete the short branch only after gates pass.

## Risk Controls

- Do not expose credentials, env values, raw DB rows, sessions, cookies, Authorization headers, plaintext
  `redeem_code`, Provider payloads, raw prompts, raw AI IO, raw employee answers, or full paper/material content.
- Do not run browser, Provider, database, schema, migration, or dependency commands.
- Do not modify `src/**`.
- Treat implementation observations as static evidence only, not runtime acceptance.
- Stop for user decision if a new product conflict appears. This package found implementation gaps against already
  confirmed decisions, not a new decision conflict.

## Validation Commands

Planned:

- `npm.cmd exec -- prettier --write --ignore-unknown <package files>`
- `npm.cmd run format:check`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId organization-analytics-ui-ux-contract-2026-07-02`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId organization-analytics-ui-ux-contract-2026-07-02`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId organization-analytics-ui-ux-contract-2026-07-02 -SkipRemoteAheadCheck`

## Closeout

Closeout is approved by the user's serial package instruction, limited to this docs-only package and subject to passing
the declared gates.
