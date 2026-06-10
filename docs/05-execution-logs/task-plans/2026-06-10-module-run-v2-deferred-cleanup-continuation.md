# Module Run v2 Deferred Cleanup Continuation Plan

## Scope

Mechanism-only repair for Module Run v2 autopilot startup behavior.

User-approved goal: stale clean automation worktree cleanup must not prevent the next autopilot run from continuing to safe task dispatch when there is no active owner, no lease, no dirty ambiguous worktree, and no high-risk gate.

## Read Before Edit

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/autodrive-control-schema.yaml`
- `docs/04-agent-system/state/mechanism-source-of-truth-index.yaml`
- Latest autopilot/mechanic diagnosis from durable automation memory and script output

## Implementation Plan

1. Add RED smoke coverage for cleanup deferral:
   - a locked or undeletable stale clean worktree must be classified as deferred cleanup, not a hard stop;
   - runner must continue after bounded stale cleanup when only clean/deferred residue remains.
2. Update hygiene cleanup to process candidates independently and record deferred cleanup actions instead of stopping on safe deletion failures.
3. Update runner control flow to perform bounded cleanup once, rerun readiness, and proceed when stale cleanup is advisory/deferred.
4. Update schema/source-of-truth docs with the new deferred cleanup decision surface.
5. Record evidence and audit review.

## Safety Boundaries

- No business implementation task claim.
- No `src/**`, DB schema, migration, dependency, package, lockfile, env, provider, Docker DB, deploy, PR, or force-push change.
- Cost Calibration Gate remains blocked.
- Cleanup behavior stays limited to repository hygiene scripts and paths inside the automation worktree root.

## Validation Plan

- RED/green smoke for `Test-ModuleRunV2StoppedAutomationHygiene.Smoke.ps1`.
- Runner smoke for `Invoke-ModuleRunV2AutopilotRunner.Smoke.ps1`.
- Startup readiness smoke.
- Autodrive control loop acceptance smoke.
- `git diff --check`.
- `npm run lint` and `npm run typecheck` using existing local tooling when available.
- Final next-autopilot takeover check with startup/runner/dispatcher readiness against current durable state.
