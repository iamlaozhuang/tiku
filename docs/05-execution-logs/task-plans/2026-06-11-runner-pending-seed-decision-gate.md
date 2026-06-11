# Runner Pending Seed Decision Gate Plan

## Task

Add a hard gate to `Invoke-ModuleRunV2AutopilotRunner.ps1` so an auto-seed transaction cannot run while the durable auto-seed approval decision says `status: pending_human_decision`.

## Trigger

User accepted the mechanism hardening recommendation and asked to keep the local primary automation unchanged for now. The user will manually switch the primary automation to `ACTIVE` only after this validation passes.

## Read Standards

- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-005-staging-architecture-and-release-boundaries.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/state/ai-task-and-provider-auto-seed-approval-decision.yaml`
- `docs/04-agent-system/operating-manual.md`

## Scope

Allowed:

- Add runner parsing for `automation.autoSeedApprovalDecisionPath`.
- Stop before `Invoke-SeedTransaction` when the referenced decision file has `status: pending_human_decision` for the current seed module.
- Add a smoke fixture that proves `-AllowAutoSeed` plus an approval statement still cannot bypass the pending decision.
- Update mechanism docs/state/evidence/audit for the new hard gate.

Blocked:

- Do not change local Codex automation registration or schedule.
- Do not resume automation, claim business tasks, or apply a real seed transaction.
- Do not change dependencies, lockfiles, product code, database schema, migrations, environment files, secrets, providers, staging/prod/cloud/deploy, payment, external services, PR settings, force push, or Cost Calibration Gate.

## Implementation Approach

1. Register this task in `project-state.yaml` and `task-queue.yaml` with narrow allowed files.
2. Add a failing runner smoke case first: fixture project-state points to an approval decision file with `status: pending_human_decision`, then invokes runner with `-AllowAutoSeed` and an approval statement. Expected result: `runnerDecision: stop_for_manual_decision`, no queue mutation, no seeded transaction.
3. Implement runner helper functions to resolve the configured decision path, parse scalar status and seed module from the YAML, and block pending human decision before any seed transaction write.
4. Update operating manual and source-of-truth index so durable ownership is explicit.
5. Run smoke, diagnostics, formatting, diff check, lint, and typecheck; write evidence before commit.

## Risk Defense

- The gate is placed after `proposal_available` and before `Invoke-SeedTransaction`, so it guards the only runner branch that mutates the queue through auto-seed.
- The smoke verifies that explicit `-AllowAutoSeed` and `autoDriveLocalImplementationApproval` are insufficient while a pending durable decision exists.
- Existing plan-only and standing approval smoke coverage remains intact to avoid broad runner behavior drift.

Cost Calibration Gate remains blocked.
