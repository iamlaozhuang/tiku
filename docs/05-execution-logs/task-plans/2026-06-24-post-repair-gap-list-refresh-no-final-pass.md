# Task Plan: post-repair-gap-list-refresh-no-final-pass-2026-06-24

## Metadata

- Task id: `post-repair-gap-list-refresh-no-final-pass-2026-06-24`.
- Branch: `codex/post-repair-gap-refresh-20260624`.
- Task kind: `docs_requirement_alignment`.
- Execution profile: `docs_acceptance_gap_refresh_no_runtime`.
- Approval consumed: current user approval on 2026-06-24 to execute the recommended next task.
- Final Pass claim: none.

## SSOT Read List

- `AGENTS.md`.
- `docs/03-standards/code-taste-ten-commandments.md`.
- `docs/02-architecture/adr/`.
- `docs/04-agent-system/operating-manual.md`.
- `docs/04-agent-system/sop/requirement-ssot-reading-governance.md`.
- `docs/04-agent-system/sop/task-lifecycle-governance.md`.
- `docs/04-agent-system/state/project-state.yaml`.
- `docs/04-agent-system/state/task-queue.yaml`.
- `docs/01-requirements/00-index.md`.
- `docs/01-requirements/modules/06-admin-ops.md`.
- `docs/01-requirements/stories/epic-06-admin-ops.md`.
- `docs/01-requirements/advanced-edition/00-index.md`.
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`.
- `docs/01-requirements/traceability/2026-06-21-content-admin-ai-generation-scope-decision.md`.
- `docs/01-requirements/traceability/2026-06-23-advanced-ai-generation-scope-clarification.md`.
- `docs/01-requirements/traceability/2026-06-24-role-separated-mvp-requirement-alignment.md`.
- `docs/01-requirements/traceability/role-experience-fulfillment-matrix.md`.
- `docs/05-execution-logs/acceptance/2026-06-24-role-separated-mvp-post-repair-gap-analysis.md`.
- `docs/05-execution-logs/evidence/2026-06-24-role-separated-post-repair-runtime-rerun.md`.
- `docs/05-execution-logs/audits-reviews/2026-06-24-role-separated-post-repair-runtime-rerun.md`.
- `docs/05-execution-logs/evidence/2026-06-24-post-repair-runtime-rerun-closeout-state-reconciliation.md`.
- `docs/05-execution-logs/evidence/2026-06-24-content-admin-ai-draft-workflow-runtime-validation.md`.
- `docs/05-execution-logs/audits-reviews/2026-06-24-content-admin-ai-draft-workflow-runtime-validation.md`.

## Requirement Mapping Result

- Source alignment remains `docs/01-requirements/traceability/2026-06-24-role-separated-mvp-requirement-alignment.md`.
- This task refreshes the gap list against the latest runtime and content_admin AI draft evidence.
- It may classify gaps, archive candidates, and next task candidates only. It does not implement requirements, run the browser, mutate accounts or data, call Provider, or declare final Pass.

## Role Mapping Result

- All eight role rows remain in scope for gap tracking:
  `personal_standard_student`, `personal_advanced_student`, `org_standard_employee`, `org_advanced_employee`,
  `org_standard_admin`, `org_advanced_admin`, `content_admin`, and `ops_admin`.
- The previous runtime rerun observed all eight rows with strict acceptance fail. This task will not change those row
  results.
- The content_admin AI draft follow-up updates only the content_admin gap detail: functional draft boundary passed, but
  Chinese UI language failed and real Provider-backed generation remains unverified.

## Acceptance Mapping Result

- Allowed conclusion: refreshed no-final-Pass gap list with next executable candidates.
- Blocked conclusion: standard/advanced MVP final Pass, release readiness, real AI generation success, staging/prod
  readiness, or any unobserved runtime row pass.

## Allowed Files

- `docs/04-agent-system/state/project-state.yaml`.
- `docs/04-agent-system/state/task-queue.yaml`.
- `docs/05-execution-logs/task-plans/2026-06-24-post-repair-gap-list-refresh-no-final-pass.md`.
- `docs/05-execution-logs/acceptance/2026-06-24-post-repair-gap-list-refresh-no-final-pass.md`.
- `docs/05-execution-logs/evidence/2026-06-24-post-repair-gap-list-refresh-no-final-pass.md`.
- `docs/05-execution-logs/audits-reviews/2026-06-24-post-repair-gap-list-refresh-no-final-pass.md`.

## Blocked Files And Actions

- Blocked files: `.env*`, `package.json`, lockfiles, `src/**`, `tests/**`, `e2e/**`, `scripts/**`, `src/db/schema/**`,
  `drizzle/**`, `.next/**`, `playwright-report/**`, `test-results/**`, and local private credential paths.
- Blocked actions: browser/runtime observation, dev-server start, credential entry or credential-file access, account
  mutation, database read/write, schema/migration, dependency changes, Provider calls/configuration, Cost Calibration,
  staging/prod/deploy, payment/external service, PR, force push, and final Pass claim.

## Plan

1. Register the task in `project-state.yaml` and `task-queue.yaml` with explicit allowed/blocked scope.
2. Refresh the gap list from the role-separated runtime evidence and the content_admin AI draft workflow evidence.
3. Record archive candidates and a prioritized next-task queue that separates low-risk local UI/source work from
   Provider/env/cost approval work.
4. Write redacted evidence and audit review.
5. Run scoped formatting, whitespace, and Module Run v2 hardening gates before closeout.

## Validation Commands

- `npx.cmd prettier --write --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-24-post-repair-gap-list-refresh-no-final-pass.md docs/05-execution-logs/acceptance/2026-06-24-post-repair-gap-list-refresh-no-final-pass.md docs/05-execution-logs/evidence/2026-06-24-post-repair-gap-list-refresh-no-final-pass.md docs/05-execution-logs/audits-reviews/2026-06-24-post-repair-gap-list-refresh-no-final-pass.md`.
- `npx.cmd prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-24-post-repair-gap-list-refresh-no-final-pass.md docs/05-execution-logs/acceptance/2026-06-24-post-repair-gap-list-refresh-no-final-pass.md docs/05-execution-logs/evidence/2026-06-24-post-repair-gap-list-refresh-no-final-pass.md docs/05-execution-logs/audits-reviews/2026-06-24-post-repair-gap-list-refresh-no-final-pass.md`.
- `git diff --check`.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId post-repair-gap-list-refresh-no-final-pass-2026-06-24`.
