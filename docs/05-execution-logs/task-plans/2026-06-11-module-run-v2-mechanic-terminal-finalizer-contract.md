# Module Run V2 Terminal Finalizer Contract

## Scope

Task 3 of the serial mechanism repair chain strengthens the terminal finalizer contract without changing product
runtime behavior.

## Read Standards

- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-005-staging-architecture-and-release-boundaries.md`

## Implementation Plan

1. Extend `Set-ModuleRunV2RunRegistryFinalizer.ps1` with terminal envelope fields:
   `severity`, `requiresHuman`, `nextCommand`, `riskIfAutoContinued`, `stateWritten`, `noWriteReason`, and
   `resumePointer`.
2. Keep existing compatibility fields, including `stopTaxonomy` and `nextRecommendedAction`.
3. Add smoke coverage for written registry paths and no-write terminal paths.
4. Update `autodrive-control-schema.yaml` and governance SOP so every terminal path has either a finalizer write or an
   explicit no-write reason.

## Risk Controls

- No runner behavior changes are introduced in this task.
- No queue transaction or seed transaction is applied.
- `Cost Calibration Gate remains blocked`.
