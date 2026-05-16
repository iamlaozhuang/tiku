# Automation Loop SOP

## Status

Draft for Phase 0

## Purpose

Define the cross-session automation loop for Tiku agent work. This SOP keeps each agent run standards-driven, scoped, verifiable, and recoverable.

## Startup Read Order

Every automation session starts by reading these sources in order:

1. `AGENTS.md`
2. `docs/03-standards/doc-management.md`
3. `docs/03-standards/code-taste-ten-commandments.md`
4. `docs/03-standards/local-ci.md`
5. `docs/03-standards/testing-tdd.md`
6. `docs/02-architecture/adr/`
7. `docs/04-agent-system/state/project-state.yaml`
8. `docs/04-agent-system/state/task-queue.yaml`

If any required source is missing, stop the loop and record the blocker before changing project files.

## Readiness Command

Run the readiness check before claiming a task:

```powershell
.\scripts\agent-system\Test-AgentSystemReadiness.ps1
```

The command is the operational readiness gate. Missing files, missing quality scripts, or unavailable local skill paths must be treated as visible evidence, not ignored.

## Task Claiming Rules

An agent may claim a task only when all of these conditions are true:

- The task status is `pending`.
- Every dependency listed by the task is `done`.
- High-risk items have explicit human approval before execution.
- The current branch is not `main` or `master`.
- The allowed file scope is clear and does not overlap with another active agent's scope.
- Dependency add, remove, or upgrade work has passed `docs/04-agent-system/sop/dependency-introduction-gate.md`.

If a task cannot be claimed cleanly, leave it unchanged and report why it is blocked.

## Execution Sequence

For each claimed task:

1. Generate or update the task plan under `docs/05-execution-logs/task-plans/` unless the active human instruction restricts the writable file scope.
2. Reconfirm the allowed file list and current Git branch.
3. Perform only the scoped edit required by the task.
4. Run available gates, starting with task-specific validation commands.
5. Write evidence for command outputs, missing gates, and any accepted residual risk.
6. Commit successful work only when the task instruction allows commits.
7. Update the queue and project state only when those files are in the allowed scope.

Each step should leave enough evidence for another agent to resume without guessing.

## Context Management

Keep session context small and durable:

- Load only the requirements, ADRs, standards, and source files needed for the active task.
- Prefer `project-state.yaml`, `task-queue.yaml`, the task plan, and evidence files as the cross-session memory source.
- Do not rely on chat memory when a durable state file contradicts it.
- If a session resumes after interruption, read the latest evidence before continuing.

## Git And Remote Repository Handling

- Do not work directly on `master` or `main` unless the user explicitly requests a read-only inspection.
- Use one short-lived branch or worktree per task.
- After a fast-forward merge into `master`, remove the task worktree and delete the merged branch.
- If no remote is configured, do not invent a repository URL.
- When a remote exists, use draft PRs by default and do not enable auto-merge.
- Push, PR creation, deployment, and production environment changes require explicit user approval.

## Failure Fuse

The loop has a hard failure fuse:

- Maximum three failures per task.
- Increment the task retry count after each failed execution attempt when queue updates are allowed.
- On the third failure, mark the task `blocked`.
- Write a failure report under `docs/06-issue-tracking/bug-reports/` when that path is in scope.
- Stop the loop after the task is blocked.

Failure reports must include the task id, failing command or step, observed output, suspected cause, and required human decision.
