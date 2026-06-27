# Three Layer Acceptance Minimal Closure High Risk Approval Matrix Task Plan

Task id: `three-layer-acceptance-minimal-closure-high-risk-approval-matrix-2026-06-27`
Branch: `codex/three-layer-acceptance-matrix-20260627`
Date: 2026-06-27

## Approval Boundary

The user approved a first docs/state-only task package for three-layer acceptance planning and high-risk approval matrix consolidation.

Allowed scope:

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/**`
- `docs/05-execution-logs/evidence/**`
- `docs/05-execution-logs/audits-reviews/**`
- `docs/05-execution-logs/acceptance/**`

Blocked scope:

- `src/**`
- `tests/**`
- `e2e/**`
- `.env*`
- `package.json` and lockfiles
- schema, Drizzle, migration, seed, and DB connection/read/write surfaces
- browser, dev server, Playwright runtime, and e2e execution
- Provider calls, Provider credential reads, Provider configuration, and Cost Calibration
- real retry/adoption mutation, formal publish, and student-visible runtime
- `staging`, `prod`, deploy, payment, external service, PR, force push, release readiness, and final Pass

Local commit is allowed. Fast-forward merge to `master`, push, and short-branch cleanup require later fresh closeout approval.

## Read Context

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
- `docs/04-agent-system/sop/dependency-introduction-gate.md`
- `docs/04-agent-system/sop/advanced-edition-cost-calibration-blocked-gate.md`
- `docs/04-agent-system/sop/advanced-edition-evidence-redaction-template.md`
- `docs/04-agent-system/sop/requirement-task-coverage-and-gap-audit-governance.md`
- `docs/04-agent-system/sop/active-queue-slimming-plan.md`
- `docs/04-agent-system/sop/module-lifecycle-governance.md`
- `docs/04-agent-system/sop/batch-execution-package-governance.md`
- `docs/04-agent-system/sop/failure-retry-and-human-takeover-governance.md`
- `docs/04-agent-system/sop/local-experience-closure-governance.md`
- `docs/04-agent-system/sop/repository-hygiene-closeout-checklist.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- Latest relevant acceptance/evidence/audit records under `docs/05-execution-logs/**`

## SSOT Read List

This task does not change requirements. It uses existing acceptance, task queue, project state, ADRs, and SOPs as evidence-only planning sources. Requirement SSOT changes and code-stage queue seeding remain blocked without later approval.

## Implementation Plan

1. Register a docs/state-only task packet in `task-queue.yaml`.
2. Update `project-state.yaml` with the current task pointer, current Git baseline, and non-execution boundary.
3. Create a three-layer acceptance and approval matrix under `docs/05-execution-logs/acceptance/`.
4. The matrix must identify:
   - Layer 1 role, entry, and permission status.
   - Layer 2 minimal local business-loop tasks and which require local controlled mutation, test data, DB read/write, or rollback approval.
   - Layer 3 Provider, cost, `staging`, `prod`, payment, OCR, export, and other high-risk gates requiring fresh approval.
   - Serial execution order versus human-approval stop points.
   - Remaining queue-size estimates for minimal three-layer closure and clearing all high-risk packages.
   - Copyable future centralized approval text that does not execute the high-risk actions.
5. Create evidence and audit review files.
6. Run scoped docs formatting, `git diff --check`, and mechanism gates that do not start runtime, browser, DB, Provider, deploy, payment, or external-service work.
7. Commit locally only. Leave merge, push, and branch cleanup blocked pending fresh closeout approval.

## Risk Controls

- Treat docs-only work as L0 governance, not runtime closure.
- Do not turn Provider smoke history into Provider readiness or Cost Calibration.
- Do not infer `staging`, `prod`, release readiness, or final Pass from local evidence.
- Preserve redaction rules: no secrets, tokens, DB URLs, raw prompts, raw outputs, Provider payloads, raw generated content, full `paper` content, raw DB rows, screenshots, or browser dumps.
- Keep `Cost Calibration Gate remains blocked pending fresh explicit approval`.
- Avoid source, test, e2e, schema, package, lockfile, env, script, and runtime artifact changes.

## Validation Commands

- `npx.cmd prettier --write --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-27-three-layer-acceptance-minimal-closure-high-risk-approval-matrix.md docs/05-execution-logs/evidence/2026-06-27-three-layer-acceptance-minimal-closure-high-risk-approval-matrix.md docs/05-execution-logs/audits-reviews/2026-06-27-three-layer-acceptance-minimal-closure-high-risk-approval-matrix.md docs/05-execution-logs/acceptance/2026-06-27-three-layer-acceptance-minimal-closure-high-risk-approval-matrix.md`
- `npx.cmd prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-27-three-layer-acceptance-minimal-closure-high-risk-approval-matrix.md docs/05-execution-logs/evidence/2026-06-27-three-layer-acceptance-minimal-closure-high-risk-approval-matrix.md docs/05-execution-logs/audits-reviews/2026-06-27-three-layer-acceptance-minimal-closure-high-risk-approval-matrix.md docs/05-execution-logs/acceptance/2026-06-27-three-layer-acceptance-minimal-closure-high-risk-approval-matrix.md`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-TikuProjectStatus.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId three-layer-acceptance-minimal-closure-high-risk-approval-matrix-2026-06-27`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId three-layer-acceptance-minimal-closure-high-risk-approval-matrix-2026-06-27`

## Stop Conditions

- Any next step requires browser/dev server/e2e runtime.
- Any next step requires DB connection/read/write/seed/migration or rollback execution.
- Any next step requires Provider call, credential read, Provider configuration, retry execution, or Cost Calibration.
- Any next step requires formal publish, student-visible runtime, `staging`, `prod`, deploy, payment, external service, PR, force push, release readiness, or final Pass.
- Evidence would need sensitive data.
- Changed files exceed the allowed docs/state/evidence/audit/acceptance scope.
