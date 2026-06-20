# Personal Learning AI Auto Seed Plan

## Task

- Transaction: `personal-learning-ai-auto-seed`
- Branch: `codex/personal-learning-ai-auto-seed`
- Approval: current user fresh approval for `personal-learning-ai` `autoDriveLocalImplementationApproval`
- Scope: low-risk local Module Run v2 L5 seed transaction for `batch-216` through `batch-219`

## Read Before Edit

- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-005-staging-architecture-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-006-runtime-dependency-alignment.md`

## Plan

1. Record the fresh approval in `personal-learning-ai-auto-seed-approval-decision.yaml`.
2. Run `New-ModuleRunV2ImplementationSeed.ps1 -Apply` with the approved low-risk L5 boundary.
3. Verify the seed creates only `batch-216` through `batch-219` low-risk implementation tasks and redacted templates.
4. Run seed self-review, next-action diagnostics, project status, lint, typecheck, and whitespace checks.
5. Write evidence/audit for the seed transaction.
6. Commit the seed transaction, fast-forward merge to `master`, push `origin/master`, and clean up the merged short branch if gates pass.

## Boundaries

- No provider/model calls or provider configuration.
- No `.env*` access or edits.
- No schema, migration, dependency, package, lockfile, deploy, payment, PR, force-push, or Cost Calibration Gate work.
- No raw prompts or raw generated AI content in evidence.
- No source changes during the seed transaction unless a validation failure exposes a separate approved repair need.

## Validation

- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ImplementationSeedSelfReview.ps1 -ExpectedModule personal-learning-ai`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-TikuNextAction.ps1 -VerboseHistory`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-TikuProjectStatus.ps1`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `git diff --check`
