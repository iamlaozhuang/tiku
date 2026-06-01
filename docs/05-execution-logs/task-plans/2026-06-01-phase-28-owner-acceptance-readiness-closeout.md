# Phase 28 Owner Acceptance Readiness Closeout Plan

## Scope

Close the Phase 27/28 batch after reconciliation and owner acceptance prep.

## Closeout Steps

1. Write final child evidence and batch evidence summary.
2. Update `project-state.yaml` handoff.
3. Run allowed read-only/governance validation commands.
4. Commit, merge to `master`, push `master`, and delete the merged short-lived branch as explicitly approved.
5. Confirm final `master`/`origin/master` alignment and no other unmerged `codex/*` branch or unknown worktree remains.

## Validation Commands

- `git status --short --branch`
- `git rev-list --left-right --count master...origin/master`
- `git branch --list`
- `git branch --no-merged master`
- `git worktree list`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-QualityGate.ps1`

## Boundaries

No force push. No unknown worktree or unmerged branch deletion.
