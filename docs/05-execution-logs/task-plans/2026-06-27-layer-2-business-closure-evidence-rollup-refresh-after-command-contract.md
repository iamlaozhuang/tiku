# Layer 2 Business Closure Evidence Rollup Refresh After Command Contract Task Plan

Task id: `layer-2-business-closure-evidence-rollup-refresh-after-command-contract-2026-06-27`

Branch: `codex/layer-2-rollup-refresh-20260627`

Task kind: `docs_state_acceptance_rollup_refresh`

moduleRunVersion: 2

## Objective

Refresh the Layer 2 business closure rollup after the latest content-admin review adopt/reject command contract TDD
evidence. This task updates only docs/state records and approval guidance. It does not execute browser, dev-server, e2e,
DB, Provider, Cost Calibration, real mutation, formal publish, student-visible runtime, staging/prod/deploy/payment,
external service, archive/index movement, PR, force push, release readiness, or final Pass.

## SSOT Read List

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-005-staging-architecture-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-006-runtime-dependency-alignment.md`
- `docs/02-architecture/adr/adr-007-edition-aware-authorization-source-of-truth.md`
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
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`

## Relevant SOPs Read

- `docs/04-agent-system/sop/docs-only-fast-lane-governance.md`
- `docs/04-agent-system/sop/task-lifecycle-governance.md`
- `docs/04-agent-system/sop/local-first-validation-governance.md`
- `docs/04-agent-system/sop/requirement-ssot-reading-governance.md`
- `docs/04-agent-system/sop/repository-hygiene-closeout-checklist.md`
- `docs/04-agent-system/sop/active-queue-slimming-plan.md`
- `docs/04-agent-system/sop/advanced-edition-cost-calibration-blocked-gate.md`
- `docs/04-agent-system/sop/local-experience-closure-governance.md`

## Requirement Decision Map

- Content-admin AI generated results must remain isolated reviewable drafts or suggestions until governed human review
  and formal adoption.
- Formal adoption into `question` or `paper` requires reviewer attribution, validation, source attribution, redacted
  traceability, and `audit_log`.
- Direct formal writes, formal publish, `mock_exam` or student-visible content from AI generation remain forbidden unless
  separately approved.
- Provider, env/secret, staging/prod, payment, external service, and Cost Calibration remain blocked.
- Layer 1 local role/entry/permission evidence is retained as a no-regression boundary, not as release readiness.

## Requirement Mapping

This refresh maps the latest source/test command-contract evidence into the Layer 2 status model:

- The previous Layer 2 gap row for explicit adopt/reject command contract can move from `Gap` to
  `Covered for source/test command contract`.
- The Layer 2 business loop still cannot be marked fully closed because this task and the predecessor did not run local
  browser, dev-server, e2e, DB runtime, real adoption mutation, formal publish, or student-visible runtime.
- The next minimal Layer 2 approvals must distinguish docs-only approval package work from actual local runtime
  execution work.

## Evidence-Only Sources

- `docs/05-execution-logs/acceptance/2026-06-27-content-admin-review-adoption-command-contract-tdd.md`
- `docs/05-execution-logs/evidence/2026-06-27-content-admin-review-adoption-command-contract-tdd.md`
- `docs/05-execution-logs/audits-reviews/2026-06-27-content-admin-review-adoption-command-contract-tdd.md`
- `docs/05-execution-logs/acceptance/2026-06-27-layer-2-business-closure-evidence-rollup.md`
- `docs/05-execution-logs/acceptance/2026-06-27-three-layer-acceptance-minimal-closure-high-risk-approval-matrix.md`
- `docs/05-execution-logs/acceptance/2026-06-27-high-risk-approval-package-consolidation-retirement.md`

These files are evidence and history. They do not supersede requirement SSOT and do not authorize runtime execution.

## Conflict Check

No requirement conflict was found. The latest evidence improves Layer 2 command-contract coverage, while the requirement
and SOP sources still require separate fresh approval for DB/runtime/browser/Provider/publish/student-visible work. The
rollup must therefore say `source/test command contract closed` and `business closure not fully closed`.

## Allowed Scope

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-06-27-layer-2-business-closure-evidence-rollup-refresh-after-command-contract.md`
- `docs/05-execution-logs/evidence/2026-06-27-layer-2-business-closure-evidence-rollup-refresh-after-command-contract.md`
- `docs/05-execution-logs/audits-reviews/2026-06-27-layer-2-business-closure-evidence-rollup-refresh-after-command-contract.md`
- `docs/05-execution-logs/acceptance/2026-06-27-layer-2-business-closure-evidence-rollup-refresh-after-command-contract.md`

## Blocked Scope

- `src/**`, `tests/**`, `e2e/**`
- `.env*`
- `package.json`, lockfiles
- schema, drizzle, migration, seed, rollback
- browser, dev server, Playwright/e2e runtime
- DB connection, DB read/write, real mutation, formal publish, student-visible runtime
- Provider call, Provider credential read, Provider configuration, Cost Calibration
- staging/prod/deploy/payment/external service, OCR/export
- archive/index movement
- PR, force push, release readiness, final Pass

## Documentation Approach

1. Register this task as a closed docs/state-only rollup refresh in `task-queue.yaml`.
2. Update `project-state.yaml` current task to this refresh with the latest Layer 2 status and blocked gates.
3. Create acceptance, evidence, and audit review docs that state:
   - Layer 1 remains complete/no-regression only.
   - Layer 2 command-contract coverage has advanced, but full business runtime closure remains blocked.
   - Layer 3 remains blocked.
   - Next approvals are copyable and split by risk boundary.
4. Preserve the existing high-risk consolidation ledger; do not move archive/index entries.

## Validation Commands

- `npx.cmd prettier --write --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-27-layer-2-business-closure-evidence-rollup-refresh-after-command-contract.md docs/05-execution-logs/evidence/2026-06-27-layer-2-business-closure-evidence-rollup-refresh-after-command-contract.md docs/05-execution-logs/audits-reviews/2026-06-27-layer-2-business-closure-evidence-rollup-refresh-after-command-contract.md docs/05-execution-logs/acceptance/2026-06-27-layer-2-business-closure-evidence-rollup-refresh-after-command-contract.md`
- `npx.cmd prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-27-layer-2-business-closure-evidence-rollup-refresh-after-command-contract.md docs/05-execution-logs/evidence/2026-06-27-layer-2-business-closure-evidence-rollup-refresh-after-command-contract.md docs/05-execution-logs/audits-reviews/2026-06-27-layer-2-business-closure-evidence-rollup-refresh-after-command-contract.md docs/05-execution-logs/acceptance/2026-06-27-layer-2-business-closure-evidence-rollup-refresh-after-command-contract.md`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-TikuProjectStatus.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId layer-2-business-closure-evidence-rollup-refresh-after-command-contract-2026-06-27`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId layer-2-business-closure-evidence-rollup-refresh-after-command-contract-2026-06-27`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId layer-2-business-closure-evidence-rollup-refresh-after-command-contract-2026-06-27 -SkipRemoteAheadCheck`

## Stop Conditions

- Any required source/test/runtime/schema/env/provider/browser/e2e/DB action appears necessary.
- Any evidence would require secrets, credentials, raw prompts, raw generated output, Provider payload, DB rows, full
  `paper` or `material`, private answer text, or plaintext `redeem_code`.
- Validation shows allowedFiles/blockedFiles drift.
- The task would need archive/index movement.
- The task would imply release readiness or final Pass.
