# Module Run v2 Approved Closeout Clean Ahead Support Plan

## Scope

- Task: `module-run-v2-approved-closeout-clean-ahead-support`
- Branch: `codex/module-run-v2-stale-clean-worktree-autocleanup-routing`
- Goal: allow approved closeout to proceed when the task branch is clean but already has committed changes ahead of `master`/`origin/master`.

## Read Inputs

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/sop/automated-advancement-governance.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `scripts/agent-system/Invoke-ModuleRunV2ApprovedCloseout.ps1`

## Implementation Approach

1. Add a clean-ahead branch check to `Invoke-ModuleRunV2ApprovedCloseout.ps1`.
2. Keep dirty closeout behavior unchanged: dirty files must remain allowed and not blocked.
3. If there are no changed files, require commits ahead of the base branch before proceeding.
4. Preserve module-closeout readiness, pre-push readiness, fast-forward merge, push, cleanup, and parking gates.
5. Add smoke coverage for the clean-ahead closeout path.

## Risk Controls

- No product code, dependency, lockfile, schema, migration, env/secret, provider, e2e, deploy, or Cost Calibration Gate execution.
- No force push or PR creation.
- Remote push is limited to the explicitly approved `origin/master` closeout path.
