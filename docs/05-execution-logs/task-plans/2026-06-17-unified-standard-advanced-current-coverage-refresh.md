# Task Plan: unified-standard-advanced-current-coverage-refresh

## Scope

- Task id: `unified-standard-advanced-current-coverage-refresh`
- Branch: `codex/unified-coverage-refresh`
- Execution profile: `local_experience_audit`
- Goal: refresh `docs/04-agent-system/state/local-experience-coverage-matrix.yaml` from the current standard and advanced requirement catalogs, source/test/e2e surface inventory, and existing redacted evidence.

## Approval Boundary

The current user prompt approves executing this coverage refresh now. This task may read requirements, source, tests, e2e spec names, evidence, audits, and state files; run read-only diagnostics and `npm.cmd run test:e2e -- --list`; and update only the allowed docs/state/task-plan/evidence/audit files.

This task does not approve product source edits, test edits, e2e edits, scripts, schema/drizzle/migration, package/lockfile/dependency changes, `.env*` access, provider/model calls, dev server, Browser/Playwright runtime validation, full e2e, staging/prod/cloud/deploy/payment/external-service, PR, force-push, raw/private data exposure, public identifier inventories, or Cost Calibration Gate execution.

The prompt does not explicitly approve push closeout. Unless a later fresh approval is provided or the queue closeout policy is explicitly updated by approval, this task will stop after local validation on the short branch instead of pushing.

## Required Reads

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/*.md`
- `docs/04-agent-system/sop/local-experience-closure-governance.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/state/execution-profiles.yaml`
- `docs/04-agent-system/state/mechanism-source-of-truth-index.yaml`
- `docs/04-agent-system/state/advanced-edition-domain-module-run-matrix.yaml`
- `docs/01-requirements/use-cases/use-case-catalog.md`
- `docs/01-requirements/traceability/capability-catalog.md`
- `docs/01-requirements/traceability/unified-use-case-technical-matrix.md`
- `docs/01-requirements/traceability/unified-standard-advanced-source-index.md`
- `docs/01-requirements/traceability/unified-edition-delta-matrix.md`

## Implementation Steps

1. Confirm repository readiness and branch isolation.
2. Compare formal `UC-*` ids in the use-case catalog with coverage matrix rows.
3. List e2e specs only, without Browser/Playwright runtime execution.
4. Refresh the coverage matrix metadata and remove self-referential `nextTask` loops.
5. Update project state and task queue for this task execution boundary.
6. Write redacted evidence and audit review.
7. Run declared docs/state validation and Module Run v2 readiness gates.

## Validation Plan

- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-TikuProjectStatus.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-TikuNextAction.ps1 -VerboseHistory`
- `npm.cmd run test:e2e -- --list`
- scoped `npx.cmd prettier --check --ignore-unknown`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `git diff --check`
- `Test-ModuleRunV2PreCommitHardening.ps1 -TaskId unified-standard-advanced-current-coverage-refresh`
- `Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId unified-standard-advanced-current-coverage-refresh`
- `Test-ModuleRunV2PrePushReadiness.ps1 -TaskId unified-standard-advanced-current-coverage-refresh`

## Risk Controls

- Evidence records only counts, file/spec names, status summaries, and redacted conclusions.
- No screenshots, traces, DOM dumps, row data, raw prompts, raw answers, provider payloads, public identifier lists, or private data.
- `experience_closed` is not claimed by this task because no local full-flow runtime validation is approved.
- `release_ready` is not claimed by this task.
- Cost Calibration Gate remains blocked.
