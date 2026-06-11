# Module Run V2 Stop Economics Metrics

## Scope

Task 7 adds a read-only stop economics summarizer for `tiku-module-run-v2-autopilot`.

## Read Standards

- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-005-staging-architecture-and-release-boundaries.md`

## Implementation Plan

1. Add `Get-ModuleRunV2StopEconomics.ps1`.
2. Read run registry JSON and optional terminal envelope text.
3. Summarize false stop candidates, hard blocks, approval reuse candidates, handoff completeness, and mean runner steps
   where available.
4. Add smoke fixture coverage and register the script in `mechanism-source-of-truth-index.yaml`.

## Risk Controls

- Read-only summarizer.
- No registry write, queue write, project-state write, provider, env, schema, deploy, dependency, PR, force push, or seed apply action.
- `Cost Calibration Gate remains blocked`.
