# Module Run v2 Autodrive Phase 5 Implementation Plan

## Scope

Implement a Codex thread bridge readiness gate.

Phase 5 makes thread launch an explicit agent-layer decision after startup readiness, durable handoff, and thread launch
policy agree. It does not call Codex thread tools, create threads, send messages, create worktrees, create branches,
modify env/secrets, call providers, operate local DBs, change schema/migrations, deploy, push PRs, or execute Cost
Calibration Gate.

## Standards Read

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-005-staging-architecture-and-release-boundaries.md`
- `docs/04-agent-system/sop/thread-rollover-and-handoff-governance.md`
- `docs/04-agent-system/sop/automated-advancement-governance.md`

## Implementation Plan

1. Add `Test-ModuleRunV2CodexThreadBridgeReadiness.ps1`.
2. Add `Test-ModuleRunV2CodexThreadBridgeReadiness.Smoke.ps1`.
3. Update thread/automated advancement SOP and mechanism index.
4. Update durable state, queue, evidence, and audit.

## Bridge Model

The bridge emits `threadBridgeDecision`:

- `ready_for_agent_thread_launch`: agent layer may call `create_thread` with the verified handoff.
- `continue_current_thread`: no new thread is needed.
- `prepare_handoff`: handoff should be prepared before launch.
- `exit_active_owner_present`: a healthy active owner exists, so automation leaves the lane alone.
- `manual_required`: launch requires a human decision.
- `stop_for_hard_block`: handoff, startup, policy, or redaction is unsafe.

## Safety Boundary

- No thread creation.
- No `send_message_to_thread`.
- No branch/worktree creation.
- No cleanup.
- No product implementation.
- No env/secret/provider/local DB/schema/migration/deploy/payment/external-service action.
- No dependency/package/lockfile changes.
- No Cost Calibration Gate execution.

## Validation

- `Test-ModuleRunV2CodexThreadBridgeReadiness.Smoke.ps1`
- `Test-ModuleRunV2ThreadLaunchPolicy.Smoke.ps1`
- `Test-ModuleRunV2AutomationStartupReadiness.ps1`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `git diff --check`
- scoped Prettier write/check
- required anchor check
- `Test-ModuleRunV2ModuleCloseoutReadiness.ps1`
- `Test-GitCompletionReadiness.ps1 -BaseBranch master`

## Closeout Policy

User approved Phase 3-8 serial execution. For this Phase, after validation passes, local commit, fast-forward merge to
`master`, push to `origin/master`, and short branch cleanup are approved. Product implementation and high-risk actions
remain blocked.
