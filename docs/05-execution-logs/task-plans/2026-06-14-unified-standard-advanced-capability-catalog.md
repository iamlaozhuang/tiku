# Unified Standard Advanced Capability Catalog Task Plan

## Task

- Task id: `unified-standard-advanced-capability-catalog`
- Branch: `codex/unified-standard-advanced-capability-catalog`
- Date: 2026-06-14
- Scope: docs-only capability catalog derived from the frozen source index.

## Required Reads Completed Before Edits

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/*.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/traceability/unified-standard-advanced-source-index.md`

## Approved Writes

- Create `docs/01-requirements/traceability/capability-catalog.md`.
- Update `docs/04-agent-system/state/project-state.yaml`.
- Update `docs/04-agent-system/state/task-queue.yaml`.
- Create this task plan.
- Create `docs/05-execution-logs/evidence/2026-06-14-unified-standard-advanced-capability-catalog.md`.
- Create `docs/05-execution-logs/audits-reviews/2026-06-14-unified-standard-advanced-capability-catalog.md`.

## Blocked Work

- Do not create a use case catalog, edition delta matrix, technical matrix, code audit, code fix, schema, migration,
  implementation queue, provider work, env/secret work, e2e work, deployment work, PR, force-push, payment,
  external-service work, or Cost Calibration Gate execution.
- Do not edit `src/**`, `tests/**`, `e2e/**`, `scripts/**`, `src/db/schema/**`, `drizzle/**`, package files, lockfiles,
  `.env.local`, `.env.*`, or real secret/provider configuration files.
- Do not output raw secret, raw provider payload, raw response, database URL, row data, prompt payload, cleartext
  `redeem_code`, raw question bank content, raw paper content, student answer text, or employee subjective answer text.

## Output Requirements

The capability catalog must be based on `unified-standard-advanced-source-index.md` and each capability row must include:

- `capabilityId`
- `capabilityName`
- `sourceIds`
- `editionScope`
- `requirementStatus`
- `blockedGates`
- `conflictRefs`
- `auditUseOnly`
- `implementationEligible`
- `notes`

## Implementation Steps

1. Confirm the target task is `pending` and depends on the closed/pass input freeze task.
2. Create this plan before catalog edits.
3. Read only non-secret docs needed to map capabilities from the frozen source index and referenced requirement sources.
4. Create `capability-catalog.md` as an audit/traceability artifact, not an implementation backlog.
5. Mark standard MVP, advanced extension, future non-goal, blocked gate, and audit-only capability states explicitly.
6. Update state and queue for this task only.
7. Create evidence and audit review.
8. Run the queued validation commands and record results in evidence.
9. Commit the task as one reviewable local commit.
10. Stop on the short branch because this task's closeout policy does not approve fast-forward merge or push.

## Validation Plan

- `git diff --check`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId unified-standard-advanced-capability-catalog`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId unified-standard-advanced-capability-catalog`

## Risk Defense

- Use `sourceId` citations from the source index for every capability.
- Keep `CFX-*` conflict references unresolved unless the source index already classifies the boundary.
- Treat blocked-gate sources as gates, not implementation authorization.
- Treat historical audit sources as audit context only.
- Keep implementation eligibility separate from requirement existence.
