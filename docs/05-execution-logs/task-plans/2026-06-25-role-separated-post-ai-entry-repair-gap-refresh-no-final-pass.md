# Task Plan: role-separated-post-ai-entry-repair-gap-refresh-no-final-pass-2026-06-25

## Task Identity

- Task id: `role-separated-post-ai-entry-repair-gap-refresh-no-final-pass-2026-06-25`.
- Branch: `codex/post-ai-entry-gap-refresh-20260625`.
- Task kind: `docs_state_gap_refresh`.
- Scope: docs/state-only blocker accounting after `learner-org-employee-ai-entry-session-repair-2026-06-25`.
- Non-claim: this task must not declare Standard MVP or Advanced MVP final Pass.

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
- `docs/01-requirements/advanced-edition/00-index.md`.
- `docs/01-requirements/traceability/2026-06-24-role-separated-mvp-requirement-alignment.md`.
- `docs/01-requirements/traceability/role-experience-fulfillment-matrix.md`.
- `docs/01-requirements/traceability/edition-aware-authorization-acceptance-matrix.md`.

## Requirement Decision Map

- Role-separated acceptance remains governed by `docs/01-requirements/traceability/2026-06-24-role-separated-mvp-requirement-alignment.md`.
- Advanced role and edition boundaries remain governed by `docs/01-requirements/advanced-edition/00-index.md`, ADR-007, and `docs/01-requirements/traceability/edition-aware-authorization-acceptance-matrix.md`.
- Execution logs are evidence only and cannot override requirement SSOT.

## Requirement Mapping

- R5: personal advanced learner `AI训练` entry and personal standard denial/upgrade guidance.
- R6: organization standard employee denial for advanced AI/training and organization advanced employee discoverable AI/training entries.
- R1/R2/R3/R4: separated backend workspace and organization admin standard/advanced boundaries remain relevant but are not changed by this task.
- R7/R8/R9-R15: content/ops residual acceptance gaps remain out of this task's repair scope.

## Evidence-Only Sources

- `docs/05-execution-logs/evidence/2026-06-24-role-separated-post-repair-runtime-rerun.md`.
- `docs/05-execution-logs/audits-reviews/2026-06-24-role-separated-post-repair-runtime-rerun.md`.
- `docs/05-execution-logs/evidence/2026-06-25-role-separated-post-org-admin-repair-gap-refresh-no-final-pass.md`.
- `docs/05-execution-logs/acceptance/2026-06-25-role-separated-full-8-row-post-org-admin-repair-rerun-scope-package.md`.
- `docs/05-execution-logs/evidence/2026-06-25-learner-org-employee-ai-entry-session-repair.md`.
- `docs/05-execution-logs/audits-reviews/2026-06-25-learner-org-employee-ai-entry-session-repair.md`.

## Conflict Check

- No requirement conflict was identified.
- The learner/org employee AI source repair has focused unit evidence only; it is not runtime browser evidence.
- Therefore this task may close only source/unit-level blocker accounting and must keep the strict eight-row runtime gate blocked.

## Allowed Files

- `docs/04-agent-system/state/project-state.yaml`.
- `docs/04-agent-system/state/task-queue.yaml`.
- `docs/05-execution-logs/task-plans/2026-06-25-role-separated-post-ai-entry-repair-gap-refresh-no-final-pass.md`.
- `docs/05-execution-logs/evidence/2026-06-25-role-separated-post-ai-entry-repair-gap-refresh-no-final-pass.md`.
- `docs/05-execution-logs/audits-reviews/2026-06-25-role-separated-post-ai-entry-repair-gap-refresh-no-final-pass.md`.

## Blocked Scope

- Browser, Playwright, or e2e runtime execution.
- DB, seed, schema, migration, account mutation, or credential file access.
- Source, unit/e2e test, script, package, lockfile, env, Provider, Cost Calibration, staging/prod, payment, and external-service work.
- PR creation, force push, and final MVP Pass claims.

## Approach

1. Recompute the eight-row blocker matrix after the focused learner/org employee AI source repair.
2. Mark only unit-proven AI session/context sub-blockers as source-level closed.
3. Keep runtime/browser, discoverability, organization training, UI-label, content/ops, Provider, and final acceptance gaps blocked.
4. Register the next step as the approved full eight-row real-browser rerun, followed by the next minimal repair selected from rerun results.

## Risk Defenses

- Treat execution logs as evidence-only.
- Do not infer browser Pass from unit tests.
- Do not record credentials, tokens, cookies, localStorage, database rows, screenshots, or raw page dumps.
- Keep changed files to docs/state evidence.

## Validation Commands

- `npx.cmd prettier --write --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-25-role-separated-post-ai-entry-repair-gap-refresh-no-final-pass.md docs/05-execution-logs/evidence/2026-06-25-role-separated-post-ai-entry-repair-gap-refresh-no-final-pass.md docs/05-execution-logs/audits-reviews/2026-06-25-role-separated-post-ai-entry-repair-gap-refresh-no-final-pass.md`
- `npx.cmd prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-25-role-separated-post-ai-entry-repair-gap-refresh-no-final-pass.md docs/05-execution-logs/evidence/2026-06-25-role-separated-post-ai-entry-repair-gap-refresh-no-final-pass.md docs/05-execution-logs/audits-reviews/2026-06-25-role-separated-post-ai-entry-repair-gap-refresh-no-final-pass.md`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId role-separated-post-ai-entry-repair-gap-refresh-no-final-pass-2026-06-25`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId role-separated-post-ai-entry-repair-gap-refresh-no-final-pass-2026-06-25 -SkipRemoteAheadCheck`

## Evidence And Audit Requirements

- Evidence must include `Requirement Mapping Result`, `Role Mapping Result`, and `Acceptance Mapping Result`.
- Audit review must verify docs/state-only scope and no final Pass claim.
- Final closeout must record commit, ff-only merge, push target, and branch cleanup in the handoff rather than creating a self-referential SHA-only commit.
