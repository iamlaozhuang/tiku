# Active Queue Terminal Archive Cleanup Acceptance

Task id: `active-queue-terminal-archive-cleanup-2026-06-27`
Branch: `codex/active-queue-terminal-archive-cleanup-20260627`
Date: 2026-06-27

## Acceptance Criteria

- The two approved terminal task records are preserved in `docs/04-agent-system/state/archive/task-queue-archive-2026-06.yaml`.
- The same two task ids are no longer active queue entries in `docs/04-agent-system/state/task-queue.yaml`.
- `docs/04-agent-system/state/task-history-index.yaml` points both task ids to the June archive file.
- `docs/04-agent-system/state/project-state.yaml` reflects this cleanup as the current task.
- Required local mechanism gates are captured in evidence.
- No source, browser, DB, Provider, dependency, PR, force-push, release-readiness, or final Pass action is performed.

## Acceptance Status

Accepted.

- Both approved terminal task records are archived and indexed.
- Active queue recovery is clean for archive candidates.
- Local validation gates have passed through pre-commit hardening.
- Module closeout readiness passed.
- Merge, push, and short-branch cleanup require fresh closeout approval.
