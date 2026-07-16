# P1 Transition Pre-Push Hotfix Authorization

Date: 2026-07-16

Status: approved

Human approval source: current user message in the Codex conversation on 2026-07-16.

Task ID: `p1-prepush-transition-ancestor-gate-hotfix-2026-07-16`

Base: `4806ba0aed4c9e5f85fd65e1a663bda3e73ebce3`

## Approved Scope

The user approved an independent governance hotfix limited to pre-push orchestration, the P1 guard, Module Run guards, and corresponding smoke tests.

The only new acceptance path is an `accepted_ancestor_checkpoint` for an `in_progress` task when the same pre-push hook invocation has already passed the P1 guard as a governance-only successor transition. The transition must retain the exact `origin/master` checkpoint in both recorded repository SHA fields, target only `refs/heads/master`, and remain a fast-forward.

## Explicitly Preserved Hard Blocks

- Every other `in_progress` repository SHA drift remains hard-blocked.
- A steady-task implementation range cannot mint the transition-only mode.
- A transition containing product or other non-governance files remains hard-blocked by the P1 guard.
- Invalid remote, ref, update count, non-fast-forward, dirty worktree, non-ancestor SHA, state/origin mismatch, dependency, schema, database, Provider, runtime, browser, P2, PR, force push, and deployment boundaries remain unchanged.
- This approval does not authorize `--no-verify`, hook bypass, force push, dependency changes, product code changes, or audit-repository writes.
