# Organization Analytics Auto-Seed Plan

## Task

- Requested action: `request_auto_seed_approval:organization-analytics`.
- Branch: `codex/organization-analytics-auto-seed`.
- Scope: apply the guarded Module Run v2 implementation seed proposal for `organization-analytics`.

## Readiness Inputs

- Read `AGENTS.md`.
- Read `docs/03-standards/code-taste-ten-commandments.md`.
- Read `docs/02-architecture/adr/adr-001-tech-stack-selection.md`.
- Read `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`.
- Read `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`.
- Read `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`.
- Read `docs/02-architecture/adr/adr-005-staging-architecture-and-release-boundaries.md`.
- Read `docs/02-architecture/adr/adr-006-runtime-dependency-alignment.md`.
- Confirmed `master` and `origin/master` were aligned at `6c724c044c4cedd38b0263d036c616bab230f7de` before branching.
- Confirmed `Get-TikuProjectStatus.ps1` recommended `request_auto_seed_approval:organization-analytics`.
- Confirmed `Get-ModuleRunV2ImplementationSeedProposal.ps1` proposed batch-224 through batch-227 for `organization-analytics`.

## Implementation Strategy

1. Create a short-lived branch from clean `master`.
2. Run `New-ModuleRunV2ImplementationSeed.ps1 -Apply` using the user's current approval statement as the
   `autoDriveLocalImplementationApproval` evidence.
3. Write seed evidence and seed audit review to dated `organization-analytics-auto-seed` files.
4. Generate pending seeded task evidence/audit templates for batch-224 through batch-227.
5. Run seed self-review to verify all expected seeded tasks are present and complete.
6. Run formatting and whitespace checks before committing the seed transaction.

## Boundary

- Do not claim or implement batch-224 through batch-227 in this task.
- Do not edit `src`, schema, migration, env, dependency, provider, deploy, payment, PR, or force-push surfaces.
- Do not run browser/e2e/local DB writes or real provider/model calls.
- Keep Cost Calibration Gate blocked.
- Seeded implementation task closeout remains not approved because this approval only executes auto-seeding.

## Validation

- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-ModuleRunV2ImplementationSeedProposal.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\New-ModuleRunV2ImplementationSeed.ps1 -Apply ...`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ImplementationSeedSelfReview.ps1 ...`
- `npx.cmd prettier --write --ignore-unknown ...`
- `git diff --check`
