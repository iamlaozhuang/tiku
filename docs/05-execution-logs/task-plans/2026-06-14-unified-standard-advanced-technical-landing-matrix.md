# Unified Standard Advanced Technical Landing Matrix Task Plan

## Task

- Task id: `unified-standard-advanced-technical-landing-matrix`
- Branch: `codex/unified-standard-advanced-technical-landing-matrix`
- Date: 2026-06-14
- Scope: docs-only technical landing matrix derived from the frozen source index, capability catalog, use case catalog,
  edition delta matrix, and architecture layering documents.

## Required Reads Completed Before Edits

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/*.md`
- `docs/02-architecture/interfaces/global-db-api-skeleton.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/traceability/unified-standard-advanced-source-index.md`
- `docs/01-requirements/traceability/capability-catalog.md`
- `docs/01-requirements/use-cases/use-case-catalog.md`
- `docs/01-requirements/traceability/unified-edition-delta-matrix.md`

## Approved Writes

- Create `docs/01-requirements/traceability/unified-use-case-technical-matrix.md`.
- Update `docs/04-agent-system/state/project-state.yaml`.
- Update `docs/04-agent-system/state/task-queue.yaml`.
- Create this task plan.
- Create `docs/05-execution-logs/evidence/2026-06-14-unified-standard-advanced-technical-landing-matrix.md`.
- Create `docs/05-execution-logs/audits-reviews/2026-06-14-unified-standard-advanced-technical-landing-matrix.md`.

## Blocked Work

- Do not start code audit, implementation gap register, code fix, schema, migration, provider work, env/secret work,
  e2e work, deployment work, PR, force-push, payment, external-service work, or Cost Calibration Gate execution.
- Do not edit `src/**`, `tests/**`, `e2e/**`, `scripts/**`, `src/db/schema/**`, `drizzle/**`, package files,
  lockfiles, `.env.local`, `.env.*`, or real secret/provider configuration files.
- Do not read `src/**` or `tests/**` for implementation coverage because the user explicitly blocked code audit in
  this task. Candidate files/modules must be architecture-derived landing surfaces, not implementation findings.
- Do not output raw secret, raw provider payload, raw response, database URL, row data, prompt payload, cleartext
  `redeem_code`, raw question bank content, raw paper content, student answer text, or employee subjective answer text.

## Output Requirements

Every landing row must include:

- `landingId`
- `sourceIds`
- `capabilityIds`
- `useCaseIds`
- `deltaIds`
- `targetTechnicalLayer`
- `candidateFilesOrModules`
- `implementationEligible`
- `blockedGates`
- `conflictRefs`
- `auditUseOnly`
- `notes`

The matrix must map requirement artifacts to architecture landing surfaces only. It must not mark runtime coverage,
identify implementation defects, seed implementation tasks, or imply provider/env/schema/e2e/deploy approval.

## Implementation Steps

1. Confirm the target task is `pending` and depends on the closed/pass use case catalog and edition delta task.
2. Create this plan before matrix edits.
3. Derive landing rows from use case and delta groups, carrying `sourceId`, `capabilityId`, `useCaseId`, and `deltaId`
   values.
4. Map each row to candidate architecture layers from ADR-002 and the global DB/API skeleton:
   route/server action adapter, service, repository, model/schema, mapper/contract/validator, UI surface, worker/job,
   audit/logging, governance-only, or blocked-gate surface.
5. Preserve `auditUseOnly`, `implementationEligible`, `blockedGates`, and `conflictRefs` without adjudicating conflicts.
6. Update state and queue for this task only.
7. Create evidence and audit review.
8. Run the queued validation commands and record results in evidence.
9. Commit the task as one reviewable local commit.
10. Stop on the short branch because this task's closeout policy does not approve fast-forward merge or push and the
    user did not approve closeout in this instruction.

## Validation Plan

- `git diff --check`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId unified-standard-advanced-technical-landing-matrix`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId unified-standard-advanced-technical-landing-matrix`

## Risk Defense

- Candidate file/module paths are planning targets only, not evidence that files exist or are implemented.
- Keep `CFX-*` conflict references unresolved.
- Keep blocked-gate and audit-only rows from becoming implementation backlog.
- Keep schema/migration/provider/env/e2e/deploy/payment/external-service work blocked.
- Stop after a local commit; do not merge, push, delete branch, or claim follow-up tasks.
