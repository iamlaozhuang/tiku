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
7. `docs/04-agent-system/sop/security-review-gate.md`
8. `docs/04-agent-system/state/project-state.yaml`
9. `docs/04-agent-system/state/task-queue.yaml`

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
- High-risk security tasks have `securityReviewRequired: true` or an equivalent evidence plan.
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
5. Run `Test-NamingConventions.ps1` for API, service, contract, or route changes.
6. Write evidence for command outputs, missing gates, and any accepted residual risk. Use `New-TaskEvidence.ps1` when a new evidence skeleton is useful.
7. For high-risk tasks, complete the security review gate in `docs/04-agent-system/sop/security-review-gate.md` before merge.
8. Run a Git completion inventory with `Test-GitCompletionReadiness.ps1` or equivalent commands.
9. Commit successful work only when the task instruction allows commits; otherwise record why the work remains uncommitted.
10. Do not claim the next task while completed-task changes are still mixed with the current worktree, unless the handoff explicitly names the remaining files and reason.
11. Update the queue and project state only when those files are in the allowed scope.

Each step should leave enough evidence for another agent to resume without guessing.

## Commit Barrier

- A task is not ready for handoff until its validation output, evidence file, and Git inventory all agree on the changed file set.
- One task should normally close with one focused commit. Split commits only when the task has clearly separate approved scopes, such as dependency approval, dependency install, and business implementation.
- If final merge, push, or cleanup evidence would churn the implementation commit SHA, record `implementationCommit` and `closeoutEvidenceCommit` separately instead of repeatedly amending the same commit.
- Never bundle an allowed dependency or lockfile change into a later feature commit. Dependency work must carry its own approval evidence.
- If the user asks to continue the queue after a task is complete, first decide whether the completed task should be committed and merged before starting the next task.

## Context Management

Keep session context small and durable:

- Load only the requirements, ADRs, standards, and source files needed for the active task.
- Prefer `project-state.yaml`, `task-queue.yaml`, the task plan, and evidence files as the cross-session memory source.
- Do not rely on chat memory when a durable state file contradicts it.
- If a session resumes after interruption, read the latest evidence before continuing.

## Git And Remote Repository Handling

- Do not work directly on `master` or `main` unless the user explicitly requests a read-only inspection.
- Use one short-lived branch or worktree per task.
- After any approved merge into `master`, remove the task worktree and delete the merged branch when it no longer backs an open PR.
- If no remote is configured, do not invent a repository URL.
- When a remote exists, use draft PRs by default and do not enable auto-merge.
- Push, PR creation, deployment, and production environment changes require explicit user approval.
- Local commit, local merge, remote push, PR creation, and cleanup are separate decisions. Approval for one does not automatically approve the next.
- Before pushing `master`, fetch the remote and verify the branch is not behind `origin/master`.
- Evidence must record every approved remote action and its result.

## Closeout Sequence

After a task branch is locally merged:

1. Switch to the merge target branch.
2. Run task-relevant validation plus readiness and quality gates.
3. Write closeout evidence with commit, merge, push, and cleanup status.
4. Push only when explicitly approved.
5. Remove the task worktree and delete the merged branch only after target-branch validation and evidence are complete.

If Windows leaves a worktree directory behind because of `node_modules` or other generated residue, resolve the absolute path and confirm it is under `.worktrees/` before deleting anything.

## PR Baseline Hygiene

- Prefer one PR per task. If a task depends on an unmerged prerequisite branch, mark the PR as stacked in its body.
- When the prerequisite branch lands in `master`, retarget dependent PRs to `master`.
- Rebuild dependent task branches on latest `origin/master` when the compare includes stale prerequisite files or formatting-only noise.
- Use `--force-with-lease` for rebuilt short-lived task branches; never use an unguarded force push.
- Confirm the final compare is ahead of `master`, not behind it, and contains only task-scoped files.

## Fresh Worktree Verification

- Validate mechanism and formatting changes in a freshly created worktree from the intended base branch.
- Treat line-ending drift as a repository policy problem. The required repository policy is `.gitattributes` with `* text=auto eol=lf`.
- Do not declare `format:check` healthy based only on an existing worktree that may have local line-ending state.
- If a temporary worktree leaves dependency residue after `git worktree remove`, delete it only after resolving and confirming the target path is under `.worktrees/`.

## Failure Fuse

The loop has a hard failure fuse:

- Maximum three failures per task.
- Increment the task retry count after each failed execution attempt when queue updates are allowed.
- On the third failure, mark the task `blocked`.
- Write a failure report under `docs/06-issue-tracking/bug-reports/` when that path is in scope.
- Stop the loop after the task is blocked.

Failure reports must include the task id, failing command or step, observed output, suspected cause, and required human decision.
