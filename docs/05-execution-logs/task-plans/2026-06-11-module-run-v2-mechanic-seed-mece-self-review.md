# Module Run V2 Seed MECE Self-Review

## Scope

Task 4 strengthens auto-seed task decomposition so `tiku-module-run-v2-autopilot` can prove MECE coverage before seeded
implementation tasks are eligible for unattended execution.

## Read Standards

- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-005-staging-architecture-and-release-boundaries.md`

## Implementation Plan

1. Add structured seed candidate metadata for `requirementRefs`, `useCases`, `acceptanceScenarios`, `nonGoals`,
   `behaviorBoundary`, and `validationProfile`.
2. Persist the same metadata into seeded task queue entries.
3. Treat matrix target closure coverage as seeded task or explicit blocked remainder.
4. Extend self-review smoke failures for missing requirement refs, duplicate target closure, missing acceptance scenario,
   and missing blocked remainder.

## Risk Controls

- No real seed transaction is applied to `docs/04-agent-system/state/task-queue.yaml`.
- Smoke tests use temporary fixture queues only.
- `Cost Calibration Gate remains blocked`.
