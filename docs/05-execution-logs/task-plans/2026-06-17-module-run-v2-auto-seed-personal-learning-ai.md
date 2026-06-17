# Module Run v2 Auto Seed Plan: personal-learning-ai

## Scope

- Seed module: `personal-learning-ai`
- Source planning task: `phase-71-advanced-personal-ai-generation-implementation-planning`
- Approval: current 2026-06-17 user approval for `autoDriveLocalImplementationApproval`.
- Execution boundary: `local_unit_tdd`, `local_service_contract`, `read-model`, redacted evidence only.

## Read Before Work

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/*.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/state/execution-profiles.yaml`
- `docs/04-agent-system/state/mechanism-source-of-truth-index.yaml`

## Implementation Approach

1. Run `Get-TikuProjectStatus.ps1` and `Get-TikuNextAction.ps1` from clean `master`.
2. Apply `New-ModuleRunV2ImplementationSeed.ps1` only if the proposal remains `personal-learning-ai`.
3. Keep generated task scope limited to server model/contract/validator/service surfaces and governance logs.
4. Run seed self-review scoped to the newly generated task ids only.
5. Validate formatting and git hygiene before seed closeout.

## Guardrails

- No `.env*` read, output, or edit.
- No provider/model calls.
- No schema, Drizzle, migration, dependency, package, or lockfile changes.
- No staging, production, cloud, deploy, payment, external-service, PR, force-push, or Cost Calibration work.
- Evidence must remain redacted: no credentials, tokens, database URLs, provider payloads, raw prompts, raw answers, public identifier inventories, row data, or private data.

## Planned Validation

- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ImplementationSeedSelfReview.ps1 -ExpectedModule personal-learning-ai -SeedTaskIds <new seed task ids>`
- `git diff --check`
- `npm.cmd run format:check`
