# Batch 224 Organization Analytics Metrics Plan

## Task

- Task id: `batch-224-organization-analytics-aggregate-only-organization-metrics`
- Branch: `codex/batch-224-organization-analytics-metrics`
- Scope: low-risk local Module Run v2 L5 validation for organization-analytics aggregate-only organization metrics.

## Readiness Inputs

- Read `AGENTS.md`.
- Read `docs/03-standards/code-taste-ten-commandments.md`.
- Read `docs/02-architecture/adr/adr-001-tech-stack-selection.md`.
- Read `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`.
- Read `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`.
- Read `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`.
- Read `docs/02-architecture/adr/adr-005-staging-architecture-and-release-boundaries.md`.
- Read `docs/02-architecture/adr/adr-006-runtime-dependency-alignment.md`.
- Read batch-224 queue block and organization-analytics auto-seed evidence.
- Read existing organization-analytics model, contract, validator, service, route, and admin entry focused unit tests.
- Pre-edit auto-seed readiness passed for candidate batch-224.

## Implementation Strategy

1. Claim batch-224 on the current branch while preserving high-risk blocks.
2. Replace the advisory focused placeholder with the scoped unit command:
   `npm.cmd run test:unit -- src/server/models/organization-analytics.test.ts src/server/contracts/organization-analytics-contract.test.ts src/server/validators/organization-analytics.test.ts src/server/services/organization-analytics-service.test.ts src/server/services/organization-analytics-route.test.ts tests/unit/organization-analytics-admin-entry-surface.test.ts`.
3. Run existing focused unit coverage first. If it validates aggregate-only dashboard metrics, API contract mapping, route
   boundaries, and admin entry behavior, do not change source or tests.
4. If the focused unit exposes a missing contract, stop unless the repair is a narrow local source/test change inside the
   task allowed files; do not expand into schema, DB, browser/e2e, provider, env, dependency, or deploy work.
5. Write redacted evidence and audit records without raw employee answer text, full paper content, provider payloads,
   internal DB rows, secrets, raw prompts, or raw generated AI content.
6. Run lint, typecheck, `git diff --check`, pre-commit hardening, module closeout readiness, and pre-push readiness.
7. Commit validation, commit closeout, fast-forward merge to master, push, and delete the merged short branch under the
   current approval if all gates pass.

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
- No full paper content, raw employee answer text, raw prompt, raw generated AI content, provider payload, secret, or
  internal DB row in evidence.

## Validation

- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ImplementationAutoSeedReadiness.ps1 -TaskId phase-73-advanced-organization-analytics-implementation-planning -CandidateTaskId batch-224-organization-analytics-aggregate-only-organization-metrics -EvidencePath docs\05-execution-logs\evidence\2026-06-20-organization-analytics-auto-seed.md`
- `npm.cmd run test:unit -- src/server/models/organization-analytics.test.ts src/server/contracts/organization-analytics-contract.test.ts src/server/validators/organization-analytics.test.ts src/server/services/organization-analytics-service.test.ts src/server/services/organization-analytics-route.test.ts tests/unit/organization-analytics-admin-entry-surface.test.ts`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId batch-224-organization-analytics-aggregate-only-organization-metrics`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId batch-224-organization-analytics-aggregate-only-organization-metrics`
