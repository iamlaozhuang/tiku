# Module Run v2 Recovery Chain Hardening Plan

## Scope

Close the remaining Module Run v2 unattended autodrive recovery-chain gaps found by the local mechanism self-check.

This task is mechanism-only. It may update local governance scripts, smoke tests, SOP/state/schema/index files, task
queue entries, evidence, audit review, and the paused Codex app automation prompt. It must not implement business
features, run real local Docker DB operations, read project paper/material resources for testing, write env/secrets,
call providers, change dependencies or lockfiles, modify schema/migrations, run e2e, deploy, create PRs, force push, or
execute Cost Calibration Gate.

## Standards Read

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-005-staging-architecture-and-release-boundaries.md`
- `docs/04-agent-system/sop/automated-advancement-governance.md`

## Findings To Fix

1. `closeout_recovery` can be emitted by the runner but is not mapped by the dispatcher and serial executor.
2. `reconcile_post_closeout_state_sha` is a recovery decision but has no bounded transaction executor.
3. `Test-ModuleRunV2UnattendedReadiness.ps1` writes a run registry heartbeat even during diagnostics.
4. Run registry lifecycle does not classify expired `active` records with missing worktree paths.
5. Local `codex/` branch hygiene is not classified by a guardrail script.
6. Durable `codexAutomationStatus` is stale relative to the paused Codex app automation.
7. Local capability gate examples must consistently use `-Intent`, not `-Action`.

## Implementation Plan

1. Add a post-closeout state reconciliation script and smoke tests.
2. Wire `closeout_recovery` through runner, dispatcher, and serial executor as a bounded recovery handoff.
3. Add `-NoWrite` to unattended readiness and keep heartbeat writing only for real owner registration.
4. Extend stopped automation hygiene to classify and safely clean expired active registry files whose worktree path is
   missing.
5. Add local `codex/` branch hygiene classification for merged and unmerged local branches.
6. Update acceptance/smoke coverage, SOP/schema/index/state/queue, evidence, and audit review.
7. Update the paused Codex app automation prompt after script contracts are stable.

## Validation

- `Test-ModuleRunV2WorkReadiness.ps1 -Mode pre-edit`
- New and updated smoke tests for recovery, dispatcher, serial executor, unattended readiness, stopped automation
  hygiene, post-closeout state reconciliation, and branch hygiene.
- `Test-ModuleRunV2AutodriveControlLoopAcceptance.ps1`
- `Test-ModuleRunV2AutomationStartupReadiness.ps1`
- `Test-ModuleRunV2UnattendedReadiness.ps1 -NoWrite -CloseoutRecovery`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `git diff --check`
- Scoped Prettier write/check
- `Test-ModuleRunV2ModuleCloseoutReadiness.ps1`
- `Test-GitCompletionReadiness.ps1 -BaseBranch master`

## Closeout Policy

User approved this serial mechanism fix task. After validation passes, local commit, fast-forward merge to `master`,
push `origin/master`, and cleanup of the short-lived `codex/module-run-v2-recovery-chain-hardening` branch are approved.
Product implementation and high-risk actions remain blocked.
