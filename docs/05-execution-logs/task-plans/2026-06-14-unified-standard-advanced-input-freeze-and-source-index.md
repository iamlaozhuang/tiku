# Unified Standard Advanced Input Freeze And Source Index Task Plan

## Task

- Task id: `unified-standard-advanced-input-freeze-and-source-index`
- Branch: `codex/unified-standard-advanced-input-freeze-and-source-index`
- Date: 2026-06-14
- Scope: docs-only source freeze and source index.

## Required Reads Completed Before Edits

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/*.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/traceability/unified-standard-advanced-use-case-audit-plan.md`
- `docs/01-requirements/traceability/unified-standard-advanced-audit-campaign-plan.md`
- Recent evidence and audit records for:
  - `2026-06-14-unified-standard-advanced-use-case-audit-planning`
  - `2026-06-14-unified-standard-advanced-audit-campaign-seeding`
  - `2026-06-14-unified-standard-advanced-planning-closeout-baseline`
  - `batch-178`
  - `batch-180`
  - `current-state-checkpoint-and-implementation-audit`

## Approved Writes

- Create `docs/01-requirements/traceability/unified-standard-advanced-source-index.md`.
- Update `docs/04-agent-system/state/project-state.yaml`.
- Update `docs/04-agent-system/state/task-queue.yaml`.
- Create this task plan.
- Create `docs/05-execution-logs/evidence/2026-06-14-unified-standard-advanced-input-freeze-and-source-index.md`.
- Create `docs/05-execution-logs/audits-reviews/2026-06-14-unified-standard-advanced-input-freeze-and-source-index.md`.

## Blocked Work

- No `src/**`, `tests/**`, `e2e/**`, `scripts/**`, `schema/migration`, `drizzle/**`, package, or lockfile edits.
- No `.env.local`, `.env.*`, secret, provider config, raw provider payload, raw response, database URL, row data, or cleartext `redeem_code` access or output.
- No provider call, model request, quota use, staging/prod/cloud/deploy, payment, external-service, schema/migration, e2e, PR, force-push, code audit, code fix, or implementation.
- No capability catalog, use case catalog, technical matrix, consistency audit, or queue seeding.

## Implementation Steps

1. Create this task plan before source index edits.
2. Read the non-secret source documents needed to classify sources:
   - Standard edition requirement index, modules, and stories.
   - Standard/MVP audit records from Phase 12, Phase 18, and Phase 19.
   - Advanced edition specs, plans, requirement index, modules, and stories.
   - Phase 56 advanced edition coverage audit.
   - Batch 178 and Batch 180 boundary records.
   - Current checkpoint and unified planning/campaign records.
3. Create a source index with one row per frozen source and the required fields:
   - `sourceId`
   - `path`
   - `sourceKind`
   - `editionScope`
   - `authorityLevel`
   - `usedFor`
   - `knownConflicts`
   - `blockedGates`
   - `redactionNotes`
4. Explicitly separate source kinds:
   - `authoritative_source`
   - `supporting_source`
   - `historical_audit_source`
   - `blocked_gate_source`
   - `excluded_source`
   - `conflict_pending_source`
5. Update state and queue to claim and close this task only after evidence and audit are written.
6. Record validation output in the task evidence.
7. Commit the task as one reviewable commit.
8. If the task-level closeout policy has been legally materialized from this fresh approval and all gates pass, fast-forward merge to `master`, run closeout and pre-push validation on `master`, push `origin/master`, delete the merged short branch, reread state/queue, and stop.

## Validation Plan

- `git diff --check`
- `npx.cmd prettier --check --ignore-unknown docs/01-requirements/traceability/unified-standard-advanced-source-index.md docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-14-unified-standard-advanced-input-freeze-and-source-index.md docs/05-execution-logs/evidence/2026-06-14-unified-standard-advanced-input-freeze-and-source-index.md docs/05-execution-logs/audits-reviews/2026-06-14-unified-standard-advanced-input-freeze-and-source-index.md`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId unified-standard-advanced-input-freeze-and-source-index`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId unified-standard-advanced-input-freeze-and-source-index`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId unified-standard-advanced-input-freeze-and-source-index`

## Risk Defense

- Treat requirements and accepted requirement docs as authoritative for later catalog extraction.
- Treat historical audits as historical coverage and finding context unless they identify a governance blocker or conflict.
- Treat batch-178, batch-180, and staging/provider/deploy records as blocked-gate sources, not implementation authorization.
- Treat current checkpoint findings as audit context only; do not fix or expand implementation in this task.
- Record conflicts as pending for future catalog/audit tasks instead of resolving them by implementation judgment.
