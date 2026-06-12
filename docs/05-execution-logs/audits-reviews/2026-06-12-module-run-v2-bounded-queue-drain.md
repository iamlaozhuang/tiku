# Module Run v2 Bounded Queue Drain Audit Review

## Review status

APPROVE

## Follow-up review fixes

- Fixed eligibility task parsing so nested task-local `- id:` entries no longer truncate drain policy, allowed files,
  blocked files, validation, evidence, or closeout policy checks.
- Fixed queue drain changed-line budget so staged diff and untracked file content count toward `MaxChangedLines`.
- Fixed closeout recovery manifest/output traceability so `queueDrainNextTask` falls back to project-state
  `currentTask.id` when runner output omits `runnerNextTask`.
- Fixed high-risk `riskTypes` parsing so quoted and line-commented YAML list scalars still hit hard-block rules.
- Fixed manifest path containment so same-prefix sibling directories are not misclassified as repository-contained
  paths.
- Materialized the bounded queue drain task in durable state so pre-commit scope checks audit this task directly.

## Review checklist

- Drain eligibility defaults to safe no-drain.
- High-risk tasks cannot be silently drained.
- Supervisor does not bypass existing Module Run v2 gates.
- Repo-external manifest does not leak secrets or raw payloads.
- Product code remains `single_task_only` in this phase.
- Nested task-local `- id:` entries do not create false hard blocks.
- Quoted or line-commented high-risk `riskTypes` cannot be silently drained.
- Staged and untracked line budgets cannot bypass the drain fuse.
- Closeout recovery outputs a recoverable task id for manifest handoff.
- Same-prefix sibling manifest roots remain valid repo-external paths.
- `project-state.yaml` and `task-queue.yaml` point pre-commit scope checks at `module-run-v2-bounded-queue-drain`.
- Cost Calibration Gate remains blocked.

## Residual risk

The supervisor is a protocol layer, not an agent implementation engine. It returns the next allowed agent-layer action;
the agent must still perform task implementation, validation, evidence, audit, and closeout through existing gates.
