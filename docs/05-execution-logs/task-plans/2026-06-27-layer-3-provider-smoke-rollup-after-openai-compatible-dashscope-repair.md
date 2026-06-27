# Layer 3 Provider Smoke Rollup After OpenAI-Compatible DashScope Repair Plan

Task id: `layer-3-provider-smoke-rollup-after-openai-compatible-dashscope-repair-2026-06-27`

Branch: `codex/provider-smoke-rollup-20260627`

## Objective

Refresh docs/state after the approved OpenAI-compatible DashScope Provider smoke passed. This task is docs/state-only and
does not execute Provider, env/secret, Cost Calibration, DB, browser/e2e, staging/prod/deploy/payment, OCR/export, PR,
force push, release readiness, or final Pass.

## SSOT Read List

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/traceability/2026-06-23-advanced-ai-generation-scope-clarification.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-005-staging-architecture-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-006-runtime-dependency-alignment.md`
- `docs/02-architecture/adr/adr-007-edition-aware-authorization-source-of-truth.md`
- `docs/04-agent-system/sop/task-lifecycle-governance.md`
- `docs/04-agent-system/sop/docs-only-fast-lane-governance.md`
- `docs/04-agent-system/sop/advanced-edition-evidence-redaction-template.md`
- `docs/04-agent-system/sop/advanced-edition-cost-calibration-blocked-gate.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/evidence/2026-06-27-layer-3-provider-smoke-openai-compatible-dashscope-config-boundary-repair-retry.md`
- `docs/05-execution-logs/acceptance/2026-06-27-layer-3-provider-smoke-openai-compatible-dashscope-config-boundary-repair-retry.md`

## Approval Boundary

This is a docs/state-only continuation task under the current Goal and docs-only fast-lane boundary. It may update only
project state, task queue, and task plan/evidence/audit/acceptance documents for the Layer 3 Provider smoke rollup.

Blocked:

- `.env*` read/write/output, credential handling, Provider calls, Provider configuration execution, Cost Calibration
  execution, DB connection/read/write, browser/dev-server/e2e, source/test/script/package/lockfile/schema/migration/seed
  changes;
- formal publish, student-visible runtime, staging/prod/deploy/payment/external-service, OCR/export;
- archive/index movement, PR, force push, release readiness, or final Pass.

## Execution Plan

1. Register this docs/state-only rollup task in `task-queue.yaml` with exact allowed files, blocked files, validation
   commands, and closeout policy.
2. Update `project-state.yaml` so Layer 3 Provider smoke status reflects the passed OpenAI-compatible DashScope evidence
   while Cost Calibration and pre-release gates remain blocked.
3. Create evidence/audit/acceptance documents summarizing the pass and the blocked remainder.
4. Provide copyable next approval text for the next smallest safe task: docs/state-only Cost Calibration approval package
   refresh, not Cost Calibration execution.
5. Run scoped Prettier write/check, `git diff --check`, project status, and Module Run v2 closeout gates.
6. Commit, ff-only merge, push, and delete the short branch only if the task-scoped closeout policy passes.

## Requirement Decision Map

- Layer 1: unchanged, complete baseline preserved.
- Layer 2: unchanged, local PostgreSQL `rejected` review-command minimum business loop remains the current minimum local
  business closure evidence.
- Layer 3 Provider smoke: passed for `openai_compatible` / `alibaba-qwen` / `qwen3.7-max` with baseUrlHost
  `dashscope.aliyuncs.com`.
- Layer 3 Cost Calibration: blocked pending fresh approval and an approval package.
- Layer 3 staging/prod/deploy/payment/OCR/export/pre-release: blocked pending separate approvals and evidence.

## Evidence-Only Sources

The Provider smoke evidence is used as execution evidence. It does not authorize any further Provider calls, Cost
Calibration, provider cost measurement, staging/prod, deploy, payment, OCR/export, release readiness, or final Pass.

## Conflict Check

Current evidence proves one local dev Provider smoke pass on the explicit OpenAI-compatible DashScope boundary. It also
explicitly says Cost Calibration and pre-release gates remain blocked. This rollup must preserve both facts.

## Validation Commands

- `npx.cmd prettier --write --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-27-layer-3-provider-smoke-rollup-after-openai-compatible-dashscope-repair.md docs/05-execution-logs/evidence/2026-06-27-layer-3-provider-smoke-rollup-after-openai-compatible-dashscope-repair.md docs/05-execution-logs/audits-reviews/2026-06-27-layer-3-provider-smoke-rollup-after-openai-compatible-dashscope-repair.md docs/05-execution-logs/acceptance/2026-06-27-layer-3-provider-smoke-rollup-after-openai-compatible-dashscope-repair.md`
- `npx.cmd prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-27-layer-3-provider-smoke-rollup-after-openai-compatible-dashscope-repair.md docs/05-execution-logs/evidence/2026-06-27-layer-3-provider-smoke-rollup-after-openai-compatible-dashscope-repair.md docs/05-execution-logs/audits-reviews/2026-06-27-layer-3-provider-smoke-rollup-after-openai-compatible-dashscope-repair.md docs/05-execution-logs/acceptance/2026-06-27-layer-3-provider-smoke-rollup-after-openai-compatible-dashscope-repair.md`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-TikuProjectStatus.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId layer-3-provider-smoke-rollup-after-openai-compatible-dashscope-repair-2026-06-27`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId layer-3-provider-smoke-rollup-after-openai-compatible-dashscope-repair-2026-06-27`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId layer-3-provider-smoke-rollup-after-openai-compatible-dashscope-repair-2026-06-27 -SkipRemoteAheadCheck`
