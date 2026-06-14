# Unified Code Audit Findings Rollup And Repair Queue Seeding Task Plan

## Task

- Task id: `unified-code-audit-findings-rollup-and-repair-queue-seeding-entry-creation`
- Seeded pending task id: `unified-code-audit-findings-rollup-and-repair-queue-seeding`
- Branch: `codex/unified-code-audit-findings-rollup-and-repair-queue-seeding`
- Date: 2026-06-14
- Start checkpoint: `7c6ff4dc61bf289b88c0041627b380342592488d`
- Task kind: `docs_only_pending_task_seed`

## Purpose

Create one pending docs-only follow-up queue task after confirming no existing eligible pending rollup/seeding task was
present. This task plan records the completed queue-item creation boundary only. It does not execute the future rollup
task.

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
- Completed unified standard MVP code audit evidence and audit reviews for auth scope, organization auth,
  question/paper, student experience, AI/RAG governed, and admin ops/logs.

## Approved Scope

Allowed writes for this queue-entry creation:

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-06-14-unified-code-audit-findings-rollup-and-repair-queue-seeding.md`
- `docs/05-execution-logs/evidence/2026-06-14-unified-code-audit-findings-rollup-and-repair-queue-seeding.md`
- `docs/05-execution-logs/audits-reviews/2026-06-14-unified-code-audit-findings-rollup-and-repair-queue-seeding.md`

Read-only inputs:

- `docs/**`
- `scripts/**`

Blocked files:

- `.env.local`
- `.env.example`
- `.env.*`
- `package.json`
- `pnpm-lock.yaml`
- `package-lock.yaml`
- `package-lock.json`
- `src/**`
- `tests/**`
- `e2e/**`
- `src/db/schema/**`
- `drizzle/**`
- `scripts/**`

## Future Pending Task Contract

The seeded pending task may only:

1. Read completed code-audit evidence and audit reviews.
2. Merge duplicate findings.
3. Assign or normalize severity.
4. Map every finding to `sourceId`, `capabilityId`, `useCaseId`, `landingId`, and where applicable `deltaId`.
5. Split later repair candidate tasks without implementing them.
6. Record for each repair candidate:
   - `allowedFiles`
   - `blockedFiles`
   - `validationCommands`
   - `blockedGates`
   - human approval boundary
   - evidence redaction boundary

The pending task must not perform code fixes, implementation, schema/migration, dependency changes, provider/env work,
e2e, deploy, PR, force-push, payment, external-service work, or Cost Calibration.

## Validation Plan

- `git diff --check`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId unified-code-audit-findings-rollup-and-repair-queue-seeding-entry-creation`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId unified-code-audit-findings-rollup-and-repair-queue-seeding-entry-creation`

After the local commit and passing gates, the user's fresh approval permits fast-forward merge to `master`,
closeout/pre-push validation on `master`, `push origin master`, deletion of the merged short branch, rereading state and
queue, then stopping without claiming the seeded pending task.

## Risk Controls

- The seeded task remains `pending`.
- No audit finding is merged in this task.
- No repair candidate is created in this task.
- No source, test, script, schema, migration, package, lockfile, env/secret, provider, e2e, deploy, payment,
  external-service, PR, force-push, or Cost Calibration work is approved.
