# Module Run V2 State Source Ownership Map

## Scope

Task 6 documents the state ownership map for `tiku-module-run-v2-autopilot` so derived script output does not become a
second source of truth.

## Read Standards

- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-005-staging-architecture-and-release-boundaries.md`

## Implementation Plan

1. Add `factOwnership` to `mechanism-source-of-truth-index.yaml`.
2. Update automated advancement SOP with script-output-as-derived-summary policy.

## Risk Controls

- Docs-only mechanism governance change within mechanic repair scope.
- No state queue, runner behavior, seed transaction, provider, env, schema, deploy, dependency, PR, or force push action.
- `Cost Calibration Gate remains blocked`.
