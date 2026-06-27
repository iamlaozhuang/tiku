# Active Queue Terminal Archive Cleanup Task Plan

Task id: `active-queue-terminal-archive-cleanup-2026-06-27`
Branch: `codex/active-queue-terminal-archive-cleanup-20260627`
Date: 2026-06-27

## Approval Boundary

The user approved continuing this archive cleanup with both terminal tasks as candidates:

- `high-risk-blocked-task-packet-metadata-repair-2026-06-27`
- `stopped-automation-hygiene-cleanup-2026-06-27`

Allowed scope:

- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/archive/**`
- `docs/04-agent-system/state/task-history-index.yaml`
- Corresponding task plan, evidence, audit, and acceptance documents.

Blocked scope remains unchanged: source code, browser or e2e runtime, dev server, DB, Provider, credentials, dependency changes, schema or migration work, PR, force push, release readiness, and final Pass.

## Read Context

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/sop/task-queue-archival-and-index-governance.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/state/task-history-index.yaml`
- `docs/04-agent-system/state/archive/task-queue-archive-2026-06.yaml`

## Implementation Plan

1. Materialize a short-lived archive cleanup task packet in active state.
2. Preserve the two approved terminal task entries by moving their full queue records into `task-queue-archive-2026-06.yaml`.
3. Increase the June archive task count and stamp archive metadata with this cleanup task id.
4. Add task history index entries pointing each archived task to the June archive file and its evidence/audit paths.
5. Update `project-state.yaml` to reflect the active archive cleanup task and current repository baseline.
6. Run scoped docs formatting checks, queue slimming diagnostics, project status diagnostics, diff whitespace checks, lint/typecheck, and Module Run v2 hardening/readiness gates.
7. Commit locally only. Merge, push, and branch cleanup require fresh closeout approval.

## Risk Controls

- No task entry is deleted without first preserving its full YAML record in the monthly archive.
- The active queue should retain only the new in-progress cleanup task and nonterminal future work.
- No browser, credential, database, Provider, or source-code path is touched.
- The task stays `ready_for_closeout` after local commit unless the user gives fresh closeout approval.
