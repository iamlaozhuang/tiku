# Content Admin Review Adoption Command Contract Approval Package Plan

Task id: `content-admin-review-adoption-command-contract-approval-package-2026-06-27`

Branch: `codex/content-admin-adoption-command-approval-20260627`

Task kind: `docs_state_approval_package`

## Purpose

Create a docs/state-only approval package for the smallest remaining Layer 2 business closure task:
`content-admin-review-adoption-command-contract-tdd-2026-06-27`.

This task does not implement source or test changes. It records current code facts, exact proposed file boundaries,
blocked gates, validation commands, and copyable fresh approval text for the next source/test-only TDD task.

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
- `docs/04-agent-system/sop/task-queue-archival-and-index-governance.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/acceptance/2026-06-27-layer-2-business-closure-evidence-rollup.md`

## SSOT Read List

- `docs/01-requirements/00-index.md`
- `docs/01-requirements/modules/02-question-paper.md`
- `docs/01-requirements/modules/04-ai-scoring.md`
- `docs/01-requirements/modules/06-admin-ops.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/modules/02-ai-task-domain.md`
- `docs/01-requirements/advanced-edition/stories/epic-05-formal-content-separation.md`
- `docs/01-requirements/traceability/2026-06-21-content-admin-ai-generation-scope-decision.md`
- `docs/01-requirements/traceability/2026-06-23-advanced-ai-generation-scope-clarification.md`
- `docs/01-requirements/traceability/2026-06-24-role-separated-mvp-requirement-alignment.md`
- `docs/01-requirements/traceability/role-experience-fulfillment-matrix.md`

## Source Read-Only Facts

- `src/server/models/admin-ai-generation-formal-adoption.ts` currently permits only `approved` review decisions.
- `src/server/contracts/admin-ai-generation-formal-adoption-contract.ts` models `rejectAction` as `not_executed`.
- `src/server/repositories/admin-ai-generation-formal-adoption-repository.ts` rejects any review decision that is not
  `approved`.
- `src/server/services/admin-ai-generation-formal-adoption-runtime.test.ts` covers approved question and paper adoption
  route behavior, missing admin session, and organization-admin denial.
- Personal AI formal adoption already has an approve/reject review pattern in
  `src/server/models/personal-ai-generation-formal-adoption.ts` and
  `src/server/services/personal-ai-generation-formal-adoption-service.ts`; this is a comparison pattern only, not a
  mandate to copy the implementation.

## Requirement Decision Map

- Content-admin AI generated output remains isolated from formal `question` and `paper` until governed review/adoption.
- The smallest current Layer 2 gap is not Provider execution. It is the missing explicit content-admin reject command
  contract and its redacted traceability.
- Source/test-only work may define the command contract, validators, in-memory repository behavior, DB adapter row
  mapping, and route-handler unit behavior without connecting to DB or executing a real mutation.
- Browser/dev-server/e2e, local DB connection, Provider, Cost Calibration, formal publish, and student-visible runtime
  remain blocked.

## Evidence-Only Sources

- `docs/05-execution-logs/acceptance/2026-06-27-layer-2-business-closure-evidence-rollup.md`
- `docs/05-execution-logs/evidence/2026-06-27-layer-2-business-closure-evidence-rollup.md`
- `docs/05-execution-logs/audits-reviews/2026-06-27-layer-2-business-closure-evidence-rollup.md`
- `docs/05-execution-logs/acceptance/2026-06-27-content-admin-review-single-result-traceability-source-tdd.md`
- `docs/05-execution-logs/acceptance/2026-06-27-content-admin-review-ui-implementation-local-validation.md`
- `docs/05-execution-logs/acceptance/2026-06-27-content-admin-review-credentialed-browser-smoke-rerun.md`

## Conflict Check

The current requirement, evidence, and source facts agree: Layer 2 has meaningful local review evidence but still lacks a
complete explicit adopt/reject command contract for content-admin review. This task records an approval package only; it
does not claim the closure is complete.

## Allowed Scope

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-06-27-content-admin-review-adoption-command-contract-approval-package.md`
- `docs/05-execution-logs/evidence/2026-06-27-content-admin-review-adoption-command-contract-approval-package.md`
- `docs/05-execution-logs/audits-reviews/2026-06-27-content-admin-review-adoption-command-contract-approval-package.md`
- `docs/05-execution-logs/acceptance/2026-06-27-content-admin-review-adoption-command-contract-approval-package.md`

## Blocked Scope

- Product source or test changes in this approval-package task.
- Browser, dev server, Playwright/e2e, DB connection/read/write, schema/migration/seed/rollback, or destructive data work.
- `.env*`, credential, token, Provider key, Provider configuration, or Provider call.
- Cost Calibration, real retry/adoption mutation, formal publish, student-visible runtime, staging/prod/deploy/payment,
  OCR/export execution, external service, PR, force push, release readiness, or final Pass.
- Active queue archival/index movement; the archival SOP requires separate explicit archive/index approval.

## Implementation Approach

1. Register this approval package task in `task-queue.yaml`.
2. Add a blocked successor task `content-admin-review-adoption-command-contract-tdd-2026-06-27` with exact proposed
   source/test scope and fresh approval requirement.
3. Update `project-state.yaml` to point to this docs/state task.
4. Create acceptance, evidence, and audit review files.
5. Run scoped Prettier write/check, `git diff --check`, project status, pre-commit hardening, module closeout readiness,
   and pre-push readiness.

## Validation Commands

- `npx.cmd prettier --write --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-27-content-admin-review-adoption-command-contract-approval-package.md docs/05-execution-logs/evidence/2026-06-27-content-admin-review-adoption-command-contract-approval-package.md docs/05-execution-logs/audits-reviews/2026-06-27-content-admin-review-adoption-command-contract-approval-package.md docs/05-execution-logs/acceptance/2026-06-27-content-admin-review-adoption-command-contract-approval-package.md`
- `npx.cmd prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-27-content-admin-review-adoption-command-contract-approval-package.md docs/05-execution-logs/evidence/2026-06-27-content-admin-review-adoption-command-contract-approval-package.md docs/05-execution-logs/audits-reviews/2026-06-27-content-admin-review-adoption-command-contract-approval-package.md docs/05-execution-logs/acceptance/2026-06-27-content-admin-review-adoption-command-contract-approval-package.md`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-TikuProjectStatus.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId content-admin-review-adoption-command-contract-approval-package-2026-06-27`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId content-admin-review-adoption-command-contract-approval-package-2026-06-27`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId content-admin-review-adoption-command-contract-approval-package-2026-06-27 -SkipRemoteAheadCheck`

## Evidence And Review

- Evidence path:
  `docs/05-execution-logs/evidence/2026-06-27-content-admin-review-adoption-command-contract-approval-package.md`
- Audit review path:
  `docs/05-execution-logs/audits-reviews/2026-06-27-content-admin-review-adoption-command-contract-approval-package.md`
- Acceptance path:
  `docs/05-execution-logs/acceptance/2026-06-27-content-admin-review-adoption-command-contract-approval-package.md`

## Stop Conditions

Stop before implementation if the next step would require source/test edits without fresh approval, browser/dev-server,
e2e, DB connection, Provider work, Cost Calibration, mutation execution, formal publish, student-visible runtime,
staging/prod/deploy/payment/external-service work, PR, force push, release readiness, final Pass, or archive/index
movement.
