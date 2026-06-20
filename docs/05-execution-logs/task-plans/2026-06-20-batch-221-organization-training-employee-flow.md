# Batch 221 Organization Training Employee Flow Plan

## Task

- Task id: `batch-221-organization-training-employee-answer-lifecycle-local-role-flow`
- Branch: `codex/batch-221-organization-training-employee-flow`
- Scope: low-risk local Module Run v2 L6 validation for employee answer lifecycle local role flow.

## Readiness Inputs

- Read `AGENTS.md`.
- Read `docs/03-standards/code-taste-ten-commandments.md`.
- Read `docs/02-architecture/adr/adr-001-tech-stack-selection.md`.
- Read `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`.
- Read `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`.
- Read `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`.
- Read `docs/02-architecture/adr/adr-005-staging-architecture-and-release-boundaries.md`.
- Read `docs/02-architecture/adr/adr-006-runtime-dependency-alignment.md`.
- Read batch-221 queue block and organization-training auto-seed evidence.
- Read existing organization-training service, route, validator, and employee entry focused unit tests.
- Pre-edit auto-seed readiness passed for candidate batch-221.

## Implementation Strategy

1. Claim batch-221 on the current branch while preserving high-risk blocks.
2. Replace the advisory focused placeholder with the scoped unit command:
   `npm.cmd run test:unit -- src/server/services/organization-training-service.test.ts src/server/services/organization-training-route.test.ts src/server/validators/organization-training.test.ts tests/unit/organization-training-employee-entry-surface.test.ts`.
3. Run the existing focused unit coverage first. If it validates employee answer lifecycle, route, validator, and employee entry contracts, do not change source or tests.
4. If the focused unit exposes a missing contract, stop unless the repair is a narrow local source/test change inside the task allowed files; do not expand into schema, DB, browser/e2e, provider, env, dependency, or deploy work.
5. Write redacted evidence and audit records without raw employee answer text, full paper content, provider payloads, internal DB rows, secrets, raw prompts, or raw generated AI content.
6. Run lint, typecheck, `git diff --check`, pre-commit hardening, module closeout readiness, and pre-push readiness.
7. Commit validation, commit closeout, fast-forward merge to master, push, and delete the merged short branch under the current approval if all gates pass.

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
  execution, provider configuration, env secret access, local DB write, staging/prod/cloud action, external service, or
  Cost Calibration Gate execution.
- No raw employee answer text, full paper content, raw prompt, raw generated AI content, provider payload, secret, or
  internal DB row in evidence.

## Validation

- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ImplementationAutoSeedReadiness.ps1 -TaskId phase-72-advanced-organization-training-implementation-planning -CandidateTaskId batch-221-organization-training-employee-answer-lifecycle-local-role-flow -EvidencePath docs\05-execution-logs\evidence\2026-06-20-organization-training-auto-seed.md`
- `npm.cmd run test:unit -- src/server/services/organization-training-service.test.ts src/server/services/organization-training-route.test.ts src/server/validators/organization-training.test.ts tests/unit/organization-training-employee-entry-surface.test.ts`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId batch-221-organization-training-employee-answer-lifecycle-local-role-flow`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId batch-221-organization-training-employee-answer-lifecycle-local-role-flow`
