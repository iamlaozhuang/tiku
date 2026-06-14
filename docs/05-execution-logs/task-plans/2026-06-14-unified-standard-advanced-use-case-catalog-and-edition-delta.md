# Unified Standard Advanced Use Case Catalog And Edition Delta Task Plan

## Task

- Task id: `unified-standard-advanced-use-case-catalog-and-edition-delta`
- Branch: `codex/unified-standard-advanced-use-case-catalog-and-edition-delta`
- Date: 2026-06-14
- Scope: docs-only use case catalog and edition delta matrix derived from the frozen source index and capability catalog.

## Required Reads Completed Before Edits

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/*.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/traceability/unified-standard-advanced-source-index.md`
- `docs/01-requirements/traceability/capability-catalog.md`

## Approved Writes

- Create `docs/01-requirements/use-cases/use-case-catalog.md`.
- Create `docs/01-requirements/traceability/unified-edition-delta-matrix.md`.
- Update `docs/04-agent-system/state/project-state.yaml`.
- Update `docs/04-agent-system/state/task-queue.yaml`.
- Create this task plan.
- Create `docs/05-execution-logs/evidence/2026-06-14-unified-standard-advanced-use-case-catalog-and-edition-delta.md`.
- Create `docs/05-execution-logs/audits-reviews/2026-06-14-unified-standard-advanced-use-case-catalog-and-edition-delta.md`.

## Blocked Work

- Do not create a technical landing matrix, code audit, code fix, schema, migration, runtime implementation queue,
  provider work, env/secret work, e2e work, deployment work, PR, force-push, payment, external-service work, or Cost
  Calibration Gate execution.
- Do not edit `src/**`, `tests/**`, `e2e/**`, `scripts/**`, `src/db/schema/**`, `drizzle/**`, package files,
  lockfiles, `.env.local`, `.env.*`, or real secret/provider configuration files.
- Do not output raw secret, raw provider payload, raw response, database URL, row data, prompt payload, cleartext
  `redeem_code`, raw question bank content, raw paper content, student answer text, or employee subjective answer text.

## Output Requirements

The use case catalog must cite capability and source inputs. Each use case row must include:

- `useCaseId`
- `useCaseName`
- `capabilityIds`
- `sourceIds`
- `editionScope`
- `actor`
- `outcome`
- `requirementStatus`
- `blockedGates`
- `conflictRefs`
- `auditUseOnly`
- `implementationEligible`
- `notes`

The edition delta matrix must compare standard MVP and advanced edition scope without normalizing unresolved conflicts.
Each delta row must include:

- `deltaId`
- `capabilityIds`
- `useCaseIds`
- `sourceIds`
- `standardMvpPosition`
- `advancedEditionPosition`
- `deltaStatus`
- `blockedGates`
- `conflictRefs`
- `auditUseOnly`
- `implementationEligible`
- `notes`

## Implementation Steps

1. Confirm the target task is `pending` and depends on the closed/pass capability catalog task.
2. Create this plan before use case or delta edits.
3. Derive use cases from `capability-catalog.md` and carry source ids from
   `unified-standard-advanced-source-index.md`.
4. Create `use-case-catalog.md` as a traceability artifact, not an implementation backlog.
5. Create `unified-edition-delta-matrix.md` to show standard MVP, advanced extension, future non-goal, audit-only, and
   blocked-gate differences.
6. Update state and queue for this task only.
7. Create evidence and audit review for this task only.
8. Run the queued validation commands and record results in evidence.
9. Commit the task as one reviewable local commit.
10. Stop on the short branch because this task's closeout policy does not approve fast-forward merge, push, cleanup, or
    any next task.

## Validation Plan

- `git diff --check`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId unified-standard-advanced-use-case-catalog-and-edition-delta`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId unified-standard-advanced-use-case-catalog-and-edition-delta`

## Risk Defense

- Every use case must cite `capabilityId` values and frozen `sourceId` values.
- `auditUseOnly: true` capabilities remain audit artifacts only.
- `implementationEligible: blocked_until_gate_approved` does not authorize implementation.
- `future_non_goal` rows must not become standard MVP or advanced first-release requirements.
- `CFX-*` conflicts stay unresolved unless a later adjudication task explicitly authorizes a decision.
- Historical and blocked-gate sources may support provenance and risk notes only; they cannot authorize runtime coverage.
