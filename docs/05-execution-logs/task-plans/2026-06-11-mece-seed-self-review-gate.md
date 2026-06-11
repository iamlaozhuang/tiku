# MECE Seed Self-Review Gate Plan

## Task

Implement explicit MECE outputs and hard gates in Module Run v2 implementation seed self-review.

## Trigger

User requested the controlled auto-seed and MECE tuning plan. Task 1 completed controlled auto-seed policy; this task covers Task 2: MECE Seed Self-Review Gate.

## Read Standards

- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-005-staging-architecture-and-release-boundaries.md`
- `docs/04-agent-system/state/autodrive-control-schema.yaml`
- `scripts/agent-system/Test-ModuleRunV2ImplementationSeedSelfReview.ps1`
- `scripts/agent-system/Test-ModuleRunV2ImplementationSeedSelfReview.Smoke.ps1`

## Scope

Allowed:

- Add `meceReviewDecision`, `meceCoverageStatus`, `meceGapCount`, and `meceOverlapCount` outputs.
- Hard-block duplicate target closure, missing target closure, and missing candidate metadata.
- Update smoke coverage and mechanism docs/schema.

Blocked:

- Do not change runner auto-seed policy behavior in this task.
- Do not modify product code, dependencies, lockfiles, schema, migrations, env/secret files, providers, staging/prod/cloud/deploy, payment, external services, PR settings, force push, or Cost Calibration Gate.

## Implementation Approach

1. Add RED smoke assertions for missing MECE output fields, duplicate closure, missing closure, and missing metadata.
2. Implement counters and output fields in the self-review script.
3. Update autodrive schema/manual to make MECE fields required for seed self-review.
4. Run self-review smoke, runner smoke, diagnostics, formatting, diff check, lint, and typecheck; record evidence/audit.

Cost Calibration Gate remains blocked.
