# Preview Readiness Queue Hygiene - Archive Terminal Candidates

## Task

- Task id: `preview-readiness-queue-hygiene-archive-terminal-candidates`
- Scope: docs/state-only queue hygiene.
- User approval: user requested four docs/state-only serial tasks with independent commits.
- Branch: `codex/queue-hygiene-archive-terminal`

## Standards Read

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/sop/active-queue-slimming-plan.md`
- `scripts/agent-system/Get-ModuleRunV2QueueSlimmingSelfRepair.ps1`

## Mechanism Input

`Get-ModuleRunV2QueueSlimmingSelfRepair.ps1` reported:

- `queueSlimmingDecision: slimming_candidates`
- `activeQueueTaskCount: 75`
- `activeQueueTerminalCount: 32`
- `terminalRecoveryWindow: 8`
- `archiveCandidateCount: 24`
- `selfRepairCandidateCount: 0`
- `applyMode: diagnostic_only_v1`

Archive candidates are the first 24 terminal tasks. After this task is materialized and closed, the single displaced
terminal recovery-window task may also be archived to preserve the latest 8 terminal tasks in the active recovery
window.

## Allowed Files

- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/archive/task-queue-archive-2026-06.yaml`
- `docs/04-agent-system/state/task-history-index.yaml`
- `docs/05-execution-logs/task-plans/**`
- `docs/05-execution-logs/evidence/**`
- `docs/05-execution-logs/audits-reviews/**`

## Blocked Files And Actions

- No source code, tests, schemas, migrations, dependency manifests, lockfiles, `.env*`, provider calls, browser/e2e, deployment, or database changes.
- Do not alter non-terminal task status.
- Do not delete evidence or audit documents.

## Plan

1. Move the 24 terminal archive candidates from the active queue to `task-queue-archive-2026-06.yaml`.
2. If closing this docs/state-only task displaces the terminal recovery window, move the displaced terminal task to the archive in the same task.
3. Update archive metadata and task history index archive references.
4. Validate active queue counts and confirm no source/dependency files changed.
5. Record evidence and audit review, then commit this task only.

## Risk Controls

- Preserve task blocks as-is except for archive indentation.
- Keep latest 8 terminal tasks in `task-queue.yaml`.
- Use local read-only diagnostics after the move to verify `archiveCandidateCount: 0`.
