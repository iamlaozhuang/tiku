# Module Run v2 Unattended Blocker Hardening Plan

## Task

- Task id: `module-run-v2-unattended-blocker-hardening`
- Branch: `codex/module-run-v2-unattended-blocker-hardening`
- User goal: review recent automation threads against the target of true unattended local-first advancement, identify
  recurring blockers, and harden the mechanism.

## Sources Read

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- Recent Module Run v2 task plans, evidence, and audit reviews
- `docs/04-agent-system/sop/automated-advancement-governance.md`
- `docs/04-agent-system/sop/local-first-validation-governance.md`
- `docs/04-agent-system/sop/module-lifecycle-governance.md`

## Findings To Harden

1. Post-closeout state can lag behind Git reality. Ancestry checks prevent hard failure, but stale `commitSha:
pending-local-commit` can leak into generated handoff.
2. Handoff generation treats placeholder commit values as real values instead of falling back to `git rev-parse HEAD`.
3. Startup readiness currently reports recoverable stale worktrees but does not make stale state warnings explicit enough
   for unattended routing.
4. Fresh automation worktrees can lack local `node_modules`; local validation should distinguish "tooling missing" from
   task failure and point to a local tooling readiness gap.
5. PowerShell native command warning noise has already blocked multiple scripts; closeout wrappers should continue to
   centralize Git child-process handling.

## Implementation Plan

- Make `New-ModuleRunV2ThreadHandoff.ps1` treat `pending-local-commit`, `pending-closeout-commit`, and similar
  placeholder values as missing, then fall back to the current Git HEAD.
- Add smoke coverage proving generated handoff does not contain `pending-local-commit`.
- Add startup readiness warnings for stale-but-accepted repository state and placeholder current-task commit values,
  without turning accepted closeout ancestry into a hard block.
- Extend approved closeout output/evidence anchors so future runs can identify `postCloseoutStateReconciliation` as a
  normal recovery concern rather than a new task blocker.
- Update SOP/evidence wording so local Docker/provider/material/database authorization is treated as future task-specific
  local validation, not a blanket bypass of env/secret/provider/schema gates.

## Validation

- Run task pre-edit readiness after the task entry and plan exist.
- Run affected smoke tests.
- Run startup readiness on the real worktree.
- Run lint, typecheck, `git diff --check`, scoped Prettier check, anchor search, module closeout readiness, and Git
  completion readiness.

## Blocked Scope

Provider calls/configuration, env/secret reads or writes, staging/prod/cloud/deploy, payment, external-service,
dependency/package/lockfile changes, schema/migration changes, product API/UI/e2e implementation, Docker data mutation,
force push, and Cost Calibration Gate execution remain blocked.
