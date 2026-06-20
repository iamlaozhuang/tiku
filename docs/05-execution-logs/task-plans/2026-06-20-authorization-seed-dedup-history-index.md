# Authorization Seed Dedup History Index Plan

## Task

- Task id: `mechanism-authorization-seed-dedup-history-index`
- User approval: `批准建议`
- Scope: low-risk Module Run v2 mechanism repair for authorization seed de-duplication.

## Read Before Edit

- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-005-staging-architecture-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-006-runtime-dependency-alignment.md`

## Problem

`Get-ModuleRunV2ImplementationSeedProposal.ps1` proposes `authorization-and-access` batches `batch-101` through
`batch-104` even though those task ids are already terminal in `task-history-index.yaml` and recorded in the module
matrix `currentProgress.completedBatches`. Applying the proposal would overwrite existing evidence/audit files.

## Implementation Plan

1. Add RED smoke coverage showing archived `entries:` plus matrix `completedBatches` must make
   `authorization-and-access` complete and move seed proposal to the next module.
2. Update seed proposal parsing so task-history-index `entries:` blocks and matrix completed batch ids participate in:
   module completion checks, target closure completion checks, dependency completion checks, and next batch numbering.
3. Keep all high-risk gates blocked: no env/provider/schema/deploy/payment/dependency/package/lockfile/PR/force-push or
   Cost Calibration Gate work.
4. Run focused smoke commands, `Get-TikuNextAction`, `git diff --check`, lint/typecheck if practical, and write evidence.

## Risk Defense

- Do not change product runtime code.
- Do not modify existing completed task evidence.
- Preserve current matrix semantics and only broaden read-only completion detection.
- Keep changes limited to scripts, smoke, queue state, task plan, evidence, and audit review.
