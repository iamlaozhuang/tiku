# Phase 22 Status Normalization Plan

## Task

- Task id: `phase-22-status-normalization`
- Scope: docs-only queue state reconciliation for six completed Phase 20/22 tasks that were left as `pushed` or legacy `done`.
- Branch: `codex/phase-22-status-normalization`
- Human instruction: normalize the six previously evaluated tasks to a consistent closed state.

## Standards Read

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/03-standards/local-ci.md`
- `docs/02-architecture/adr/`
- `docs/02-architecture/interfaces/`
- `docs/04-agent-system/sop/automation-loop.md`
- `docs/04-agent-system/sop/local-human-verification.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/state/blocked-gates.yaml`
- `docs/05-execution-logs/audits-reviews/2026-05-27-phase-21-implementation-plan-breakdown.md`
- `docs/05-execution-logs/evidence/2026-05-27-phase-21-implementation-plan-breakdown.md`

## Evidence Basis

Normalize these six tasks only after verifying that each has implementation or closeout evidence, has its relevant commits in `origin/master`, and has no remaining short-lived branch or worktree residue:

- `phase-20-fix-ra-01-14-auth-expiry-reminder`
- `phase-20-fix-ra-03-01-student-home-scope-guidance`
- `phase-20-fix-ra-03-08-mock-exam-record-list`
- `phase-20-fix-ra-03-09-mistake-book-completion`
- `phase-20-fix-ra-04-03-scoring-progress-page`
- `phase-20-fix-ra-05-04-markdown-chapter-review`

## Implementation Plan

1. Update only the six task queue statuses from `pushed` or `done` to `closed`.
2. Correct the recorded full closeout commit hash in the student home scope guidance evidence.
3. Replace the stale "cleanup push pending" note in the mistake_book completion evidence with the verified cleanup commit result.
4. Add this task plan and a dedicated evidence record for the normalization.
5. Update `project-state.yaml` to point to this docs-only reconciliation task during the branch work.

## Risk Controls

- No source, test, API, schema, migration, dependency, package, lockfile, script, environment, staging, prod, cloud, deploy, provider, or destructive data changes.
- No `.env.local` or `.env.example` reads or modifications.
- No runtime behavior claim; this task only reconciles durable queue/evidence state with Git reality.
- Keep long-lived blocked gates unchanged.

## Validation Plan

- `git status --short --branch`
- Phase 20/21/22 status count script for the selected task set.
- `git diff --check`
- Changed-file Prettier check for Markdown/YAML files touched by this task.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-QualityGate.ps1`
