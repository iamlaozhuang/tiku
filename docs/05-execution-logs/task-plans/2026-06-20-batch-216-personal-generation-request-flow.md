# Batch 216 Personal Generation Request Flow Plan

## Task

- Task id: `batch-216-personal-learning-ai-personal-generation-request-flow`
- Branch: `codex/batch-216-personal-generation-request-flow`
- Scope: low-risk local Module Run v2 L5 validation for the personal AI generation request flow contract.

## Readiness Inputs

- Read `docs/03-standards/code-taste-ten-commandments.md`.
- Read `docs/02-architecture/adr/adr-001-tech-stack-selection.md`.
- Read `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`.
- Read `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`.
- Read `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`.
- Read `docs/02-architecture/adr/adr-005-staging-architecture-and-release-boundaries.md`.
- Read `docs/02-architecture/adr/adr-006-runtime-dependency-alignment.md`.
- Read batch-216 queue block and personal-learning-ai auto-seed evidence.
- Read existing personal AI generation request flow model, contract, validator, service, and focused unit test.
- Pre-edit auto-seed readiness passed for candidate batch-216.

## Implementation Strategy

1. Claim batch-216 on the current branch while preserving high-risk blocks.
2. Replace the advisory focused placeholder with the scoped unit command:
   `npm.cmd run test:unit -- src/server/services/personal-ai-generation-request-flow-service.test.ts`.
3. Run the existing focused unit first. If it validates accepted/reused/blocked/redacted local flow behavior, do not
   change source or tests.
4. If the focused unit exposes a missing contract, follow TDD strictly:
   - write the failing focused test first;
   - verify RED;
   - implement the minimum local source change;
   - verify GREEN.
5. Write redacted evidence and audit records without raw prompts, raw generated content, provider payloads, or secrets.
6. Run lint, typecheck, `git diff --check`, pre-commit hardening, and module closeout readiness.
7. Commit, fast-forward merge to master, push, and delete the merged short branch under the current approval if gates pass.

## Allowed Files

- `src/server/models/**`
- `src/server/contracts/**`
- `src/server/validators/**`
- `src/server/services/**`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/**`
- `docs/05-execution-logs/evidence/**`
- `docs/05-execution-logs/audits-reviews/**`

## Blocked Files And Capabilities

- No `.env*`.
- No `package.json`, lockfile, dependency change, schema, migration, drizzle, deploy, payment, PR, force-push, provider
  execution, provider configuration, env secret access, database write, staging/prod/cloud action, external service, or
  Cost Calibration Gate execution.
- No raw prompt or raw generated AI content in evidence.

## Validation

- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ImplementationAutoSeedReadiness.ps1 -TaskId phase-71-advanced-personal-ai-generation-implementation-planning -CandidateTaskId batch-216-personal-learning-ai-personal-generation-request-flow -EvidencePath docs\05-execution-logs\evidence\2026-06-20-personal-learning-ai-auto-seed.md`
- `npm.cmd run test:unit -- src/server/services/personal-ai-generation-request-flow-service.test.ts`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId batch-216-personal-learning-ai-personal-generation-request-flow`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId batch-216-personal-learning-ai-personal-generation-request-flow`
