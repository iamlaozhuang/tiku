# Seed Self-Review Completed Target Coverage

## Scope

- Fix `Test-ModuleRunV2ImplementationSeedSelfReview.ps1` so seed self-review accepts module coverage already satisfied by terminal targetClosure tasks in the queue.
- This is a mechanism-only repair approved by the current 2026-06-17 user prompt.
- The repair must not reduce product scope or seed fewer remaining tasks. It should prevent duplicate seeding of already completed targetClosure items while allowing pending seed tasks to cover only the remaining targets.

## Read Before Edit

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/*.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/state/execution-profiles.yaml`
- `docs/04-agent-system/state/mechanism-source-of-truth-index.yaml`
- `C:/Users/jzzhu/.codex/plugins/cache/openai-curated/superpowers/c6ea566d/skills/test-driven-development/SKILL.md`

## TDD Plan

1. RED: extend `Test-ModuleRunV2ImplementationSeedSelfReview.Smoke.ps1` with a fixture where one matrix targetClosure is already closed and the current seed only contains the remaining pending task.
2. Verify RED: smoke should fail with current script because completed targetClosure is not counted for coverage.
3. GREEN: update self-review to collect terminal completed targetClosure entries per module and use them during coverage comparison.
4. Verify GREEN: rerun the smoke plus the real organization analytics self-review scenario after seed application.

## Validation

- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ImplementationSeedSelfReview.Smoke.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ImplementationSeedSelfReview.ps1 -ExpectedModule organization-analytics -SeedTaskIds @('batch-205...', 'batch-206...', 'batch-207...')` after seed application
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\New-ModuleRunV2ImplementationSeed.ps1` plan-only
- `git diff --check`
- scoped Prettier check for changed docs/script files
- `npm.cmd run lint`
- `npm.cmd run typecheck`

## Risk Controls

- No credential/environment file access.
- No provider/model calls.
- No dependency, package, lockfile, schema, drizzle, migration, staging, prod, cloud, deploy, payment, external-service, PR, force push, or Cost Calibration Gate work.
- No product code changes.
