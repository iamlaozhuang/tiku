# Minimal Safety Kernel

## Status

Active. This is the only ordinary task enforcement procedure.

Historical P1/P0/ContentAdmin/Module Run guards, transition contracts, freshness keys and their smoke suites are
superseded and read-only. They remain available for audit but are not hook dependencies.

## Task Contract

`docs/04-agent-system/state/task-safety.json` declares the current task's:

- non-empty `taskId` and `objective`;
- exact `allowedFiles`;
- validation commands as `executable` plus `arguments[]`, never a shell expression;
- approval IDs for dependency, database/schema/migration, permission/authorization, deployment and secret/env changes;
- push target. Push still requires the one-use process environment signal `TIKU_PUSH_APPROVED=1` after fresh user approval.

The contract cannot grant high-risk authority to itself. A high-risk commit also requires an external
`TIKU_HIGH_RISK_APPROVALS` process token whose approval ID, task ID, risk category and staged tree all match the current
candidate. The token is supplied only after fresh approval and is never committed.

The contract is a reviewable boundary, not a workflow engine. It must not contain finding-specific logic, base SHAs,
transition modes, freshness keys or cached validation results.

## Pre-Commit

The hook runs `lint-staged` and then the kernel. The kernel blocks:

- direct development on `master/main` or detached HEAD;
- missing/malformed task contract;
- staged, unstaged or untracked files outside the exact allowlist;
- partially staged task worktrees;
- protected high-risk paths without a non-empty fresh approval source;
- whitespace errors;
- failed declared validation commands;
- validation commands that change HEAD, staged content/path identity, unstaged content or untracked files;
- product source changes without `test`, `lint` and `typecheck` command kinds.

Ordinary low-risk work does not require modifications to any guard or smoke and does not mechanically require separate
plan/evidence/audit files. Complex or high-risk work may add concise durable records when they carry real recovery value.

## Review

Every task receives one main-thread adversarial review after code freeze. Review the contract against the actual diff,
attack correctness and regression boundaries, and verify that validation covers the affected product surface. A separate
independent review requires fresh approval only for high-risk or explicitly requested work.

## Pre-Push And Closeout

Pre-push permits only a clean `master`, exactly one commit ahead of `origin/master`, a fast-forward update to
`origin/master`, and `TIKU_PUSH_APPROVED=1`. The hook URL and configured `origin` must both match the candidate-external
canonical URL stored in local Git config as `tiku.canonicalOriginUrl`; hook stdin must contain exactly one master update
whose local SHA equals `HEAD` and remote old SHA equals `origin/master`. PR, force-push and deployment are never inferred
from the approval signal.

After the approved push, run:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File ./scripts/agent-system/Test-MinimalSafetyKernel.ps1 -Phase closeout
```

Closeout requires `master == origin/master`, a clean worktree, one registered worktree and no `codex/`, `feat/` or
`fix/` branches. Only after this check may the next task start.

## State And Queue

`project-state.yaml` and `task-queue.yaml` remain scheduling, recovery and WIP=1 information sources. Their status changes
do not grant commit, push or high-risk authority. A normal task must never require a new guard/smoke branch merely to move
state or claim the next finding.

## Stop Conditions

Stop for user direction when scope must expand, a high-risk action lacks fresh approval, validation cannot be made green
without reducing a gate, Git topology is ambiguous, or sensitive data would enter output. Never use `--no-verify` to
escape the kernel.
