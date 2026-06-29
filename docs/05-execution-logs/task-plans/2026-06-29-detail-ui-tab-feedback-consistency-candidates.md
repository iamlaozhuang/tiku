# Detail UI Tab Feedback Consistency Task Plan

## Task

- Task id: `detail-ui-tab-feedback-consistency-candidates-2026-06-29`
- Branch: `codex/ui-tab-feedback-consistency-20260629`
- Source story: `seeded_by_detail_ui_ux_token_state_inventory_2026_06_29`
- Target closure item: align custom admin tab buttons with shared active press feedback behavior.

## SSOT Read List

- `AGENTS.md`
- `docs/03-standards/ui-code.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- Latest related UI inventory package:
  - `docs/05-execution-logs/task-plans/2026-06-29-detail-ui-ux-token-state-inventory.md`
  - `docs/05-execution-logs/evidence/2026-06-29-detail-ui-ux-token-state-inventory.md`
  - `docs/05-execution-logs/audits-reviews/2026-06-29-detail-ui-ux-token-state-inventory.md`
  - `docs/05-execution-logs/acceptance/2026-06-29-detail-ui-ux-token-state-inventory.md`

## Authorization And Scope

This is a local, task-scoped UI detail repair under the current local repair loop authorization and the queued follow-up
from `ui-inv-002`. It may edit only the named admin tab source files, their focused unit tests, and scoped governance
artifacts.

The repair must follow TDD: add a failing unit assertion for the missing active press feedback, verify RED, apply the
smallest source change, and verify GREEN. Browser/runtime/dev-server validation remains blocked by the current goal and
task queue boundary, so validation is unit/type/lint/governance only.

## Writable Files

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/traceability/2026-06-29-detail-ui-tab-feedback-consistency-candidates.md`
- `docs/05-execution-logs/task-plans/2026-06-29-detail-ui-tab-feedback-consistency-candidates.md`
- `docs/05-execution-logs/evidence/2026-06-29-detail-ui-tab-feedback-consistency-candidates.md`
- `docs/05-execution-logs/audits-reviews/2026-06-29-detail-ui-tab-feedback-consistency-candidates.md`
- `docs/05-execution-logs/acceptance/2026-06-29-detail-ui-tab-feedback-consistency-candidates.md`
- `src/components/admin/QuestionMaterialManagement/AdminQuestionMaterialManagement.tsx`
- `src/features/admin/model-config-management/AdminModelConfigManagement.tsx`
- `tests/unit/admin-question-material-ui.test.ts`
- `tests/unit/admin-model-config-management-ui.test.ts`

## Read-Only Scope Alignment Paths

- `src/components/ui/button.tsx`
- `src/features/admin/question-material-management/AdminQuestionMaterialManagement.ts`
- `src/features/admin/question-material-management/AdminQuestionMaterialManagementClient.tsx`

## Blocked Files And Actions

- No other source/test files.
- No design token, package, lockfile, dependency, schema, migration, seed, or script changes.
- No `.env*`, secrets, connection strings, credentials, cookies, tokens, sessions, localStorage, or Authorization header
  access or evidence.
- No DB connection/read/write/schema/migration/seed or raw row access.
- No AI/Provider call, Provider configuration, prompt, payload, raw AI input/output, or Cost Calibration.
- No browser runtime, dev server, raw DOM, screenshots, traces, staging, prod, cloud, deployment, release readiness,
  final Pass, PR, or force-push.

## Evidence Redaction

Allowed evidence is limited to file paths, interaction pattern category, test names, command names, pass/fail counts,
commit/branch/merge/push/cleanup status, and redacted expected/observed summaries. Evidence must not include credential,
token, session, cookie, Auth header, env, connection string, raw DB row, internal ID, PII, Provider payload, prompt, raw
AI I/O, raw DOM, screenshot, trace, or complete question/paper/material/resource/chunk content.

## Plan

1. Materialize task boundaries in state, queue, and this task plan before source/test reads or edits.
2. Inspect the scoped components, focused UI tests, and feature barrel path needed to confirm which question/material
   implementation the unit test imports.
3. Add focused failing tests that assert missing custom tab buttons include the approved `active:scale-[0.98]` feedback
   class while preserving the already compliant feature-level question/material tab.
4. Verify RED with focused Vitest.
5. Apply the smallest className changes to custom tab buttons.
6. Verify GREEN with focused Vitest, typecheck, lint, scoped formatting, diff check, and Module Run v2 gates.
7. Write redacted traceability, evidence, audit, and acceptance docs.
8. Commit, fast-forward merge to `master`, push `origin/master`, and delete the short branch if all gates pass.

## Planned Validation

- `npx.cmd vitest run tests/unit/admin-question-material-ui.test.ts tests/unit/admin-model-config-management-ui.test.ts`
- `npm.cmd run typecheck`
- `npm.cmd run lint`
- `npx.cmd prettier --write --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/01-requirements/traceability/2026-06-29-detail-ui-tab-feedback-consistency-candidates.md docs/05-execution-logs/task-plans/2026-06-29-detail-ui-tab-feedback-consistency-candidates.md docs/05-execution-logs/evidence/2026-06-29-detail-ui-tab-feedback-consistency-candidates.md docs/05-execution-logs/audits-reviews/2026-06-29-detail-ui-tab-feedback-consistency-candidates.md docs/05-execution-logs/acceptance/2026-06-29-detail-ui-tab-feedback-consistency-candidates.md src/components/admin/QuestionMaterialManagement/AdminQuestionMaterialManagement.tsx src/features/admin/model-config-management/AdminModelConfigManagement.tsx tests/unit/admin-question-material-ui.test.ts tests/unit/admin-model-config-management-ui.test.ts`
- `npx.cmd prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/01-requirements/traceability/2026-06-29-detail-ui-tab-feedback-consistency-candidates.md docs/05-execution-logs/task-plans/2026-06-29-detail-ui-tab-feedback-consistency-candidates.md docs/05-execution-logs/evidence/2026-06-29-detail-ui-tab-feedback-consistency-candidates.md docs/05-execution-logs/audits-reviews/2026-06-29-detail-ui-tab-feedback-consistency-candidates.md docs/05-execution-logs/acceptance/2026-06-29-detail-ui-tab-feedback-consistency-candidates.md src/components/admin/QuestionMaterialManagement/AdminQuestionMaterialManagement.tsx src/features/admin/model-config-management/AdminModelConfigManagement.tsx tests/unit/admin-question-material-ui.test.ts tests/unit/admin-model-config-management-ui.test.ts`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId detail-ui-tab-feedback-consistency-candidates-2026-06-29`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId detail-ui-tab-feedback-consistency-candidates-2026-06-29`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId detail-ui-tab-feedback-consistency-candidates-2026-06-29 -SkipRemoteAheadCheck`

## Closeout Policy

Local commit, fast-forward merge to `master`, push to `origin/master`, and short-branch cleanup are approved for this
low-risk local UI detail repair after validation passes. Browser/dev-server validation remains blocked unless a future
task explicitly materializes it.

## Initial Status

- Status: `in_progress_materialized_tdd_repair`
- Source/test change is limited to the four scoped files listed above.
- DB, Provider/AI, browser/dev server, dependency, release readiness, final Pass, and Cost Calibration remain blocked.
