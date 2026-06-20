# Batch 219 Redacted AI Call Log Reference Plan

## Task

- id: `batch-219-personal-learning-ai-redacted-ai-call-log-reference-without-stori`
- module: `personal-learning-ai`
- branch: `codex/batch-219-redacted-ai-call-log-reference`
- profile: L5 local implementation

## Read Standards

- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-005-staging-architecture-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-006-runtime-dependency-alignment.md`

## Local Facts

- `Get-TikuNextAction.ps1 -VerboseHistory` recommends batch-219 as the next executable task.
- Auto-seed readiness passed for batch-219.
- Existing local contract surfaces:
  - `src/server/models/personal-ai-generation-ai-call-log-reference.ts`
  - `src/server/contracts/personal-ai-generation-ai-call-log-reference-contract.ts`
  - `src/server/validators/personal-ai-generation-ai-call-log-reference.ts`
  - `src/server/services/personal-ai-generation-ai-call-log-reference-service.ts`
  - `src/server/services/personal-ai-generation-ai-call-log-reference-service.test.ts`

## Scope

- Validate the existing local read model for redacted `ai_call_log` references.
- Keep all evidence redacted: no raw prompt, raw generated AI content, provider payload, secret, or fixture echo.
- Do not perform real provider/model calls, provider configuration, env changes, schema/migration, deploy, payment, PR,
  force-push, dependency changes, or Cost Calibration Gate work.

## Validation

1. `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ImplementationAutoSeedReadiness.ps1 -TaskId phase-71-advanced-personal-ai-generation-implementation-planning -CandidateTaskId batch-219-personal-learning-ai-redacted-ai-call-log-reference-without-stori -EvidencePath docs\05-execution-logs\evidence\2026-06-20-personal-learning-ai-auto-seed.md`
2. `npm.cmd run test:unit -- src/server/services/personal-ai-generation-ai-call-log-reference-service.test.ts`
3. `npm.cmd run lint`
4. `npm.cmd run typecheck`
5. `git diff --check`
6. `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId batch-219-personal-learning-ai-redacted-ai-call-log-reference-without-stori`
7. `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId batch-219-personal-learning-ai-redacted-ai-call-log-reference-without-stori`

## Closeout

- If the focused unit and gates pass without source/test changes, record RED/GREEN evidence and close batch-219.
- Make one validation commit and one closeout commit.
- With the current fresh approval, fast-forward merge to `master`, push `origin/master`, and delete the merged short
  branch after readiness gates pass.
