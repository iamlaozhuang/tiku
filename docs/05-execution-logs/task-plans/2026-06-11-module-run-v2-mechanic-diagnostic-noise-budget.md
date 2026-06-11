# Module Run V2 Diagnostic Noise Budget

## Scope

Task 5 reduces default diagnostic noise in `Get-TikuNextAction.ps1` while preserving hard-block detail for
`tiku-module-run-v2-autopilot`.

## Read Standards

- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-005-staging-architecture-and-release-boundaries.md`

## Implementation Plan

1. Add `-VerboseHistory` to `Get-TikuNextAction.ps1`.
2. Keep default output to counts plus `notBlockingCurrentRun`.
3. Move historical first-item lists to verbose output.
4. Keep `blockedGates`, `recommendedAction`, and `stopReason` visible in default output.

## Risk Controls

- Diagnostic script remains read-only.
- Hard blocks and blocked gates are not folded.
- `Cost Calibration Gate remains blocked`.
