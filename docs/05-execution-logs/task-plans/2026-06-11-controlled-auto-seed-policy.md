# Controlled Auto-Seed Policy Plan

## Task

Implement the first tuning task from the controlled auto-seed plan: allow low-risk implementation seed transactions to proceed under a durable controlled auto-seed policy while preserving the `pending_human_decision` hard stop.

## Trigger

User requested implementation of the controlled auto-seed and MECE tuning plan. This task covers only Task 1: Controlled Auto-Seed Policy.

## Read Standards

- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-005-staging-architecture-and-release-boundaries.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/state/autodrive-control-schema.yaml`
- `docs/04-agent-system/state/ai-task-and-provider-auto-seed-approval-decision.yaml`
- `docs/04-agent-system/operating-manual.md`

## Scope

Allowed:

- Add a durable decision status for controlled auto-seed policy approval.
- Allow the runner to auto-apply a proposal when the configured decision file approves the current module under controlled auto-seed policy.
- Keep `pending_human_decision` as a hard stop that command-line approval cannot bypass.
- Update the current ai-task-and-provider decision file from pending to controlled policy approval, without changing local Codex automation registration.
- Add smoke coverage for policy-approved auto-seed and pending-decision hard stop.

Blocked:

- Do not change local Codex automation registration or set automation to `ACTIVE`.
- Do not modify product code, dependencies, lockfiles, database schema, migrations, env/secret files, providers, staging/prod/cloud/deploy, payment, external services, PR settings, force push, or Cost Calibration Gate.

## Implementation Approach

1. Update queue/current task metadata for this scoped mechanism repair.
2. Add RED smoke coverage: a fixture with `approved_by_controlled_auto_seed_policy` should auto-seed without explicit `-AllowAutoSeed`; the existing pending fixture should still hard-stop.
3. Implement runner policy parsing and effective approval statement derivation for the approved policy status.
4. Update schema/manual/decision record so the durable policy is the source of truth.
5. Run targeted smoke, real project diagnostics, formatting, diff check, lint, and typecheck; write evidence and audit.

Cost Calibration Gate remains blocked.
