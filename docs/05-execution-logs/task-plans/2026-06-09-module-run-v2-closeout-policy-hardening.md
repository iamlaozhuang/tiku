# Module Run v2 Closeout Policy Hardening Plan

## Task

- Task id: `module-run-v2-closeout-policy-hardening`
- Branch: `codex/module-run-v2-closeout-policy-hardening`
- Task kind: `implementation`
- Goal: make approved commit, fast-forward merge, push, short-lived branch cleanup, and worktree parking executable from a durable `closeoutPolicy` instead of fragile `humanApproval` prose.

## Documents Read

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/sop/automated-advancement-governance.md`
- `docs/04-agent-system/sop/task-lifecycle-governance.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`

## Implementation Approach

1. Add RED smoke coverage for structured `closeoutPolicy`, `ready_for_closeout`, and autopilot closeout execution for clean-ahead branches.
2. Teach unattended readiness and approved closeout scripts to recognize `ready_for_closeout` only when structured closeout policy is complete.
3. Teach autopilot to invoke approved closeout when structured policy allows it and either dirty task-scoped files or committed branch-ahead work exists.
4. Extend pre-push readiness so `ready_for_closeout` receives the same closeout SHA ancestry exception as `done` and `closed`.
5. Update SOPs and evidence to make `closeoutPolicy` the durable authority.

## Risk Controls

- No product code, provider/env/secret, dependency, schema/migration, e2e, deploy, payment, external-service, PR, or force-push work.
- Smoke tests use temporary repositories only.
- The current dirty acceptance-planning branch in `df5e` is preserved in its own worktree and is not mixed into this mechanism branch.

## Validation

- RED/GREEN smoke tests for unattended readiness, autopilot, and approved closeout.
- Startup readiness.
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `git diff --check`
- Scoped Prettier write/check.
- Anchor check for `closeoutPolicy`, `ready_for_closeout`, `structuredCloseoutPolicy`, `closeout_executed`, and `Cost Calibration Gate remains blocked`.
