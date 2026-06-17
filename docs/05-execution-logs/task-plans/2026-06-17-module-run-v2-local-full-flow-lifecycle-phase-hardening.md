# Module Run v2 local full-flow lifecycle phase hardening

- Task ID: `module-run-v2-local-full-flow-lifecycle-phase-hardening`
- Branch: `codex/local-full-flow-lifecycle-phase-hardening`
- Created: `2026-06-17T16:02:28-07:00`
- Execution profile: `docs_state_lite`
- Evidence mode: `full`
- Validation policy: `docs_state`

## Required Standards Read

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/*.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/state/execution-profiles.yaml`
- `docs/04-agent-system/state/mechanism-source-of-truth-index.yaml`
- `superpowers:test-driven-development`
- `superpowers:verification-before-completion`

## Scope

Harden `Test-ModuleRunV2ModuleCloseoutReadiness.ps1` so `validationCommandLifecycle` entries with unsupported phases,
especially `phase: validation`, fail with a direct hard block and guidance to use `post_edit` for runnable validation commands.

Allowed write scope:

- `scripts/agent-system/Test-ModuleRunV2ModuleCloseoutReadiness.ps1`
- `scripts/agent-system/Test-ModuleRunV2ModuleCloseoutReadiness.Smoke.ps1`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- this task plan, evidence, and audit files

## Non-Goals

- No product implementation.
- No route/UI/source/e2e/spec/test fixture changes outside the named mechanism smoke.
- No env/secret access.
- No provider/model call.
- No dependency, package, lockfile, schema, drizzle, migration, staging/prod/cloud/deploy/payment/external-service, PR, force-push, or Cost Calibration Gate work.

## TDD Plan

1. Add a smoke fixture that uses `phase: validation` and expects `HARD_BLOCK_INVALID_VALIDATION_LIFECYCLE_PHASE` plus
   `post_edit` guidance.
2. Run the smoke and capture the expected RED failure.
3. Implement the smallest closeout readiness change to collect lifecycle phases, reject unsupported phases, and keep valid
   `post_edit`/`closeout` command filtering unchanged.
4. Re-run the smoke to GREEN.
5. Run formatting, lint, typecheck, diff, project-status, next-action, and Module Run v2 closeout gates.

## Risk Controls

- The change is local PowerShell validation logic only.
- Existing valid lifecycle behavior must remain covered by the current smoke fixture.
- Evidence records command outcomes and policy results only; no private data or secrets are copied.
