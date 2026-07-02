# Queue And Execution Log Archive Dry-Run Inventory Task Plan

## Task

- Task ID: `queue-and-execution-log-archive-dry-run-inventory-2026-07-02`
- Branch: `codex/queue-and-execution-log-archive-dry-run-inventory`
- Scope: docs-only dry-run inventory for future task-queue and execution-log archive movement.

## Read Requirements

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/state/task-history-index.yaml`
- `docs/05-execution-logs/execution-log-index.yaml`
- `docs/04-agent-system/state/recent-thread-governance-baseline.yaml`
- `docs/04-agent-system/sop/active-queue-slimming-plan.md`
- `docs/04-agent-system/sop/task-queue-archival-and-index-governance.md`
- `docs/04-agent-system/sop/execution-log-archival-and-index-governance.md`

## Implementation Plan

1. Measure current active queue, project state, history index, execution-log index, and active execution-log directory sizes.
2. Select a conservative first archive candidate batch of closed July AI-generation task blocks.
3. Verify candidate task plan, evidence, and audit paths exist.
4. Verify candidate tasks are not depended on by any non-terminal active task.
5. Record exact future task queue archive target, execution-log archive targets, and required index entries.
6. Update project state and task queue for this dry-run task only.
7. Write redacted evidence and adversarial review.

## Non-Goals

- No task block movement.
- No execution-log movement.
- No archive file creation.
- No index entry creation for the candidates.
- No product code, test, script behavior, Provider, browser, DB, env/secret, dependency, schema, migration, deploy, release readiness, final Pass, production usability, or Cost Calibration work.

## Validation

- `npm.cmd exec -- prettier --write --ignore-unknown ...`
- `npm.cmd exec -- prettier --check --ignore-unknown ...`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId queue-and-execution-log-archive-dry-run-inventory-2026-07-02`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId queue-and-execution-log-archive-dry-run-inventory-2026-07-02`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId queue-and-execution-log-archive-dry-run-inventory-2026-07-02 -SkipRemoteAheadCheck`
