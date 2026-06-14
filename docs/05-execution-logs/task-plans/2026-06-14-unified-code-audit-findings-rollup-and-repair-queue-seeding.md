# Unified Code Audit Findings Rollup And Repair Queue Seeding Task Plan

## Task

- Task id: `unified-code-audit-findings-rollup-and-repair-queue-seeding`
- Branch: `codex/unified-code-audit-findings-rollup-and-repair-queue-seeding`
- Date: 2026-06-14
- Start checkpoint: `83d5f6c7eb03064bcc4f3495f806b866248c8c0f`
- Task kind: `docs_only_audit_findings_rollup_queue_seeding`

## Fresh Instruction

The user explicitly instructed: execute `unified-code-audit-findings-rollup-and-repair-queue-seeding`, docs-only, only
roll up existing findings and seed repair candidate tasks.

This instruction approves claiming and completing this docs-only queue task. It does not approve code fixes,
implementation, schema/migration, provider/env work, e2e, dependency changes, staging/prod/cloud/deploy, payment,
external-service work, PR, force-push, or Cost Calibration.

## Required Inputs Read

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/*.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/traceability/unified-standard-advanced-source-index.md`
- `docs/01-requirements/traceability/capability-catalog.md`
- `docs/01-requirements/use-cases/use-case-catalog.md`
- `docs/01-requirements/traceability/unified-edition-delta-matrix.md`
- `docs/01-requirements/traceability/unified-use-case-technical-matrix.md`
- `docs/05-execution-logs/evidence/2026-06-14-unified-blocked-gate-provider-checkpoint-guard.md`
- `docs/05-execution-logs/audits-reviews/2026-06-14-unified-blocked-gate-provider-checkpoint-guard.md`
- Completed unified standard MVP code audit evidence and audit reviews for:
  - auth scope
  - organization auth
  - question/paper
  - student experience
  - AI/RAG governed
  - admin ops/logs

## Approved Scope

Allowed writes:

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-06-14-unified-code-audit-findings-rollup-and-repair-queue-seeding.md`
- `docs/05-execution-logs/evidence/2026-06-14-unified-code-audit-findings-rollup-and-repair-queue-seeding.md`
- `docs/05-execution-logs/audits-reviews/2026-06-14-unified-code-audit-findings-rollup-and-repair-queue-seeding.md`

Read-only inputs:

- `docs/**`
- `scripts/**`

Blocked files and actions:

- `.env.local`, `.env.example`, `.env.*`, real secret files, and provider configuration files.
- `src/**`, `tests/**`, `e2e/**`, `src/db/schema/**`, `drizzle/**`, `scripts/**`.
- `package.json`, lockfiles, dependency installation, schema/migration, e2e execution, provider/model requests, quota
  use, staging/prod/cloud/deploy, payment, external-service work, PR, force-push, and Cost Calibration.

## Implementation Plan

1. Preserve the six completed code audits as historical findings only; do not execute a new code audit.
2. Deduplicate recurring findings by theme and retain the original source finding ids.
3. Normalize severity by highest inherited severity and risk class.
4. Map each rollup row to `sourceId`, `capabilityId`, `useCaseId`, `landingId`, and where applicable `deltaId`.
5. Seed later repair candidate tasks as `pending` queue entries only.
6. For every candidate, record `allowedFiles`, `blockedFiles`, `validationCommands`, `blockedGates`, and human approval
   boundary.
7. Write evidence and audit review with explicit blocked remainder.

## Validation Plan

- `git diff --check`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId unified-code-audit-findings-rollup-and-repair-queue-seeding`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId unified-code-audit-findings-rollup-and-repair-queue-seeding`

No merge, push, PR, force-push, or deploy is approved by this task plan.

## Risk Controls

- This task does not read or modify runtime code.
- Repair candidates are queue metadata only and remain `pending`.
- Any candidate that later touches runtime code, auth/session behavior, schema, provider/env, dependency, e2e, deploy,
  payment, external-service, PR, force-push, or Cost Calibration requires a separate fresh user instruction and its own
  task plan/evidence/audit/commit.
