# Unified Standard Advanced Consistency And Risk Audit Task Plan

## Task

- Task id: `unified-standard-advanced-consistency-and-risk-audit`
- Branch: `codex/unified-standard-advanced-consistency-and-risk-audit`
- Date: 2026-06-14
- Scope: docs-only consistency and risk audit across the frozen source index, capability catalog, use case catalog,
  edition delta matrix, and technical landing matrix.

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
- `docs/01-requirements/traceability/unified-use-case-technical-matrix.md`
- `docs/05-execution-logs/evidence/2026-06-14-unified-standard-advanced-technical-landing-matrix.md`
- `docs/05-execution-logs/audits-reviews/2026-06-14-unified-standard-advanced-technical-landing-matrix.md`

## Approved Writes

- Create this task plan.
- Create `docs/05-execution-logs/evidence/2026-06-14-unified-standard-advanced-consistency-and-risk-audit.md`.
- Create `docs/05-execution-logs/audits-reviews/2026-06-14-unified-standard-advanced-consistency-and-risk-audit.md`.
- Update `docs/04-agent-system/state/project-state.yaml`.
- Update `docs/04-agent-system/state/task-queue.yaml`.

## Blocked Work

- Do not start implementation queue seeding, code audit, code fixes, implementation, schema, migration, provider work,
  env/secret work, e2e work, deployment work, PR, force-push, payment, external-service work, or Cost Calibration Gate
  execution.
- Do not edit `src/**`, `tests/**`, `e2e/**`, `scripts/**`, `src/db/schema/**`, `drizzle/**`, package files,
  lockfiles, `.env.local`, `.env.*`, or real secret/provider configuration files.
- Do not read env/secret/provider configuration files.
- Do not output raw secret, raw provider payload, raw response, database URL, row data, prompt payload, cleartext
  `redeem_code`, raw question bank content, raw paper content, student answer text, or employee subjective answer text.

## Audit Steps

1. Confirm repository posture, target task status, dependencies, allowed files, blocked files, and validation commands.
2. Create this task plan before evidence/audit edits.
3. Mechanically check traceability closure:
   - capability `sourceIds` resolve to source index ids;
   - use case `capabilityIds` and `sourceIds` resolve;
   - delta `capabilityIds`, `useCaseIds`, and `sourceIds` resolve;
   - landing `sourceIds`, `capabilityIds`, `useCaseIds`, and `deltaIds` resolve.
4. Check reverse coverage from the technical matrix back to the catalogs:
   - all capability ids are referenced by at least one landing row;
   - all use case ids are referenced by at least one landing row;
   - all delta ids are referenced by at least one landing row.
5. Check landing row field completeness and consistency:
   - required fields are present;
   - `auditUseOnly: true` rows use `implementationEligible: false`;
   - blocked-gate and excluded/future rows do not imply implementation approval.
6. Record risk findings, non-blocking carry-forward notes, excluded sources, and pending conflicts without adjudicating
   them.
7. Create evidence and audit review.
8. Update state and queue for this task only.
9. Run queued validation commands and record results in evidence.
10. Commit the task as one reviewable local commit.
11. Stop on the short branch because this task's closeout policy does not approve fast-forward merge or push and the
    user did not approve closeout in this instruction.

## Validation Plan

- `git diff --check`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId unified-standard-advanced-consistency-and-risk-audit`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId unified-standard-advanced-consistency-and-risk-audit`

## Risk Defense

- Treat candidate file/module paths in the technical matrix as planning surfaces only, not runtime coverage evidence.
- Keep `CFX-*` conflict references unresolved.
- Keep blocked-gate, audit-only, future non-goal, and excluded-source rows from becoming implementation backlog.
- Keep schema/migration/provider/env/e2e/deploy/payment/external-service work blocked.
- Stop after a local commit; do not merge, push, delete branch, or claim follow-up tasks.
