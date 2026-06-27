# Layer 2 Business Closure Evidence Rollup Plan

Task id: `layer-2-business-closure-evidence-rollup-2026-06-27`

Branch: `codex/layer-2-business-rollup-20260627`

Task kind: `docs_state_acceptance_rollup`

## Purpose

Create a docs/state-only Layer 2 business closure evidence rollup that maps existing local evidence to the smallest
remaining business-function closure chain. This task prepares a clear next approval boundary; it does not execute local
browser, DB, Provider, Cost Calibration, mutation, publish, staging/prod, payment, or external-service work.

## Already Read Before Plan

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-005-staging-architecture-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-006-runtime-dependency-alignment.md`
- `docs/02-architecture/adr/adr-007-edition-aware-authorization-source-of-truth.md`
- `docs/04-agent-system/sop/task-lifecycle-governance.md`
- `docs/04-agent-system/sop/docs-only-fast-lane-governance.md`
- `docs/04-agent-system/sop/local-first-validation-governance.md`
- `docs/04-agent-system/sop/requirement-ssot-reading-governance.md`
- `docs/04-agent-system/sop/requirement-task-coverage-and-gap-audit-governance.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/advanced-edition/00-index.md`

## SSOT Read List

This task must read or confirm the following durable requirement sources before writing the final rollup:

- `docs/01-requirements/00-index.md`
- `docs/01-requirements/modules/02-question-paper.md`
- `docs/01-requirements/modules/04-ai-scoring.md`
- `docs/01-requirements/modules/06-admin-ops.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/modules/02-ai-task-domain.md`
- `docs/01-requirements/advanced-edition/modules/03-personal-ai-generation.md`
- `docs/01-requirements/advanced-edition/modules/08-organization-ai-generation.md`
- `docs/01-requirements/advanced-edition/stories/epic-05-formal-content-separation.md`
- `docs/01-requirements/traceability/2026-06-21-content-admin-ai-generation-scope-decision.md`
- `docs/01-requirements/traceability/2026-06-23-advanced-ai-generation-scope-clarification.md`
- `docs/01-requirements/traceability/2026-06-24-role-separated-mvp-requirement-alignment.md`
- `docs/01-requirements/traceability/role-experience-fulfillment-matrix.md`

## Requirement Decision Map

- Content admin AI generation remains an advanced/content operation scope, not standard MVP automatic formal adoption.
- AI generated content must remain isolated until a governed human review/adoption path is proven.
- Formal `question` and `paper` adoption, publish, and student-visible runtime remain blocked unless separately approved.
- Layer 2 local business closure can only be claimed for the exact evidence row supported by existing local evidence.
- Cost Calibration Gate, real Provider readiness, staging/prod, payment, OCR, export, release readiness, and final Pass remain blocked.

## Requirement Mapping

The rollup will map each Layer 2 candidate row to:

- requirement or traceability source;
- role and user-facing flow;
- current evidence path;
- highest local validation level;
- coverage status: `covered`, `partial`, `gap`, or `blocked`;
- next approval required.

## Evidence-Only Sources

Execution logs are evidence and history only. The final rollup may cite, but must not treat them as requirement SSOT:

- `docs/05-execution-logs/acceptance/2026-06-27-three-layer-acceptance-minimal-closure-high-risk-approval-matrix.md`
- `docs/05-execution-logs/acceptance/2026-06-27-high-risk-approval-package-consolidation-retirement.md`
- `docs/05-execution-logs/acceptance/2026-06-27-content-admin-review-single-result-traceability-source-tdd.md`
- `docs/05-execution-logs/acceptance/2026-06-27-content-admin-review-ui-implementation-local-validation.md`
- `docs/05-execution-logs/acceptance/2026-06-27-content-admin-review-credentialed-browser-smoke-rerun.md`
- `docs/05-execution-logs/acceptance/2026-06-27-content-admin-review-batch-selection-source-contract-tdd.md`
- `docs/05-execution-logs/acceptance/2026-06-27-content-admin-review-failed-retry-source-contract-tdd.md`
- `docs/05-execution-logs/acceptance/2026-06-27-content-admin-review-result-diff-read-model-source-tdd.md`
- `docs/05-execution-logs/acceptance/2026-06-27-content-admin-review-adoption-history-read-model-source-tdd.md`
- `docs/05-execution-logs/acceptance/2026-06-27-content-admin-review-batch-retry-diff-history-ui-local-validation.md`
- `docs/05-execution-logs/acceptance/2026-06-27-formal-publish-local-execution-one-draft-paper.md`
- `docs/05-execution-logs/acceptance/2026-06-27-learner-ai-generation-private-result-practice-paper-attempt-tdd.md`
- `docs/05-execution-logs/acceptance/2026-06-27-organization-analytics-admin-ui-implementation-local-validation.md`

## Conflict Check

Current known state is consistent: existing evidence shows partial Layer 2 local business progress, while requirement and
acceptance boundaries still block formal adoption, publish/student-visible runtime, DB mutation, browser rerun, and
Provider/cost/staging gates without fresh approval.

If later source reading shows a conflict, this task must record the conflict and stop at a docs-only clarification
recommendation.

## Allowed Scope

- Edit `docs/04-agent-system/state/project-state.yaml`.
- Edit `docs/04-agent-system/state/task-queue.yaml`.
- Add or edit this task plan.
- Add evidence, audit review, and acceptance rollup under `docs/05-execution-logs/`.

## Blocked Scope

- `src/**`, `tests/**`, `e2e/**`, scripts, schema, drizzle, migration, seed, package, and lockfile changes.
- Browser, dev server, Playwright/e2e, DB connection/read/write, migration, seed, rollback, or destructive operations.
- `.env*`, credential, token, secret, Provider credential, Provider configuration, or Provider call.
- Cost Calibration, real retry/adoption mutation, formal publish, student-visible runtime, staging/prod/deploy/payment,
  OCR execution, export generation, external service, PR, force push, release readiness, or final Pass.

## Implementation Approach

1. Read the SSOT and evidence-only sources listed above.
2. Register this task in `task-queue.yaml` with explicit allowed files, blocked files, validation commands, and
   closeout policy materialized from the current user instruction to use one short branch and close out after task
   completion.
3. Update `project-state.yaml` with current task status and Layer 2 rollup summary.
4. Create an acceptance rollup with a coverage matrix for Layer 2 local business closure.
5. Create evidence and audit review documenting validation and residual gaps.
6. Run scoped Prettier write/check, `git diff --check`, project status, Module Run v2 pre-commit hardening, module
   closeout readiness, and pre-push readiness before any push.

## Validation Commands

- `npx.cmd prettier --write --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-27-layer-2-business-closure-evidence-rollup.md docs/05-execution-logs/evidence/2026-06-27-layer-2-business-closure-evidence-rollup.md docs/05-execution-logs/audits-reviews/2026-06-27-layer-2-business-closure-evidence-rollup.md docs/05-execution-logs/acceptance/2026-06-27-layer-2-business-closure-evidence-rollup.md`
- `npx.cmd prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-27-layer-2-business-closure-evidence-rollup.md docs/05-execution-logs/evidence/2026-06-27-layer-2-business-closure-evidence-rollup.md docs/05-execution-logs/audits-reviews/2026-06-27-layer-2-business-closure-evidence-rollup.md docs/05-execution-logs/acceptance/2026-06-27-layer-2-business-closure-evidence-rollup.md`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-TikuProjectStatus.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId layer-2-business-closure-evidence-rollup-2026-06-27`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId layer-2-business-closure-evidence-rollup-2026-06-27`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId layer-2-business-closure-evidence-rollup-2026-06-27 -SkipRemoteAheadCheck`

## Evidence And Review

- Evidence path: `docs/05-execution-logs/evidence/2026-06-27-layer-2-business-closure-evidence-rollup.md`
- Audit review path: `docs/05-execution-logs/audits-reviews/2026-06-27-layer-2-business-closure-evidence-rollup.md`
- Acceptance path: `docs/05-execution-logs/acceptance/2026-06-27-layer-2-business-closure-evidence-rollup.md`

## Stop Conditions

Stop before execution if the next useful step requires source/test changes, DB read/write, local runtime/browser,
credential access, Provider calls, Cost Calibration, mutation, formal publish, student-visible runtime, staging/prod,
payment, external service, PR, force push, release readiness, or final Pass.
