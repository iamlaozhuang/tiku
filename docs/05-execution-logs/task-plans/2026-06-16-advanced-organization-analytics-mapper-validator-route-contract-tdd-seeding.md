# Task Plan: Advanced Organization Analytics Mapper Validator Route Contract TDD Seeding

## Task

- Task id: `advanced-organization-analytics-mapper-validator-route-contract-tdd-seeding`
- Branch: `codex/organization-analytics-mapper-validator-route-contract-seeding`
- Date: 2026-06-16
- Scope: docs/state-only queue seeding for a future narrow TDD task.

## Read Before Edit

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-005-staging-architecture-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-006-runtime-dependency-alignment.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/evidence/2026-06-16-advanced-organization-analytics-route-runtime-boundary-readonly-audit.md`
- `docs/05-execution-logs/audits-reviews/2026-06-16-advanced-organization-analytics-route-runtime-boundary-readonly-audit.md`
- `src/server/contracts/organization-analytics-contract.ts`
- `src/server/models/organization-analytics.ts`

## Local State

- Starting branch baseline: `master == origin/master == c465db3d69c6828484ca94489bfe8df615390597`.
- Existing queue check found `PENDING_COUNT=0`.
- Prior readonly audit decision: do not wire organization analytics REST route directly against current internal service DTOs; introduce mapper/validator/route-contract boundary first.

## Implementation Plan

1. Add this docs/state-only seeding task as closed in `task-queue.yaml`.
2. Seed one pending task: `advanced-organization-analytics-mapper-validator-route-contract-tdd`.
3. Limit the pending TDD task to mapper, validator, contract, and unit test files only.
4. Keep route runtime wiring, App Router files, service/repository runtime changes, schema/migration, DB execution, UI, provider, dependencies, e2e/browser/dev-server, staging/prod/cloud/deploy/payment/external-service, PR, force push, and Cost Calibration Gate blocked.
5. Update `project-state.yaml` to reflect this seeding closeout and point the handoff to the pending TDD task.
6. Write redacted evidence and audit review for the queue change.

## Validation Plan

- `git diff --check`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId advanced-organization-analytics-mapper-validator-route-contract-tdd-seeding`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId advanced-organization-analytics-mapper-validator-route-contract-tdd-seeding`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId advanced-organization-analytics-mapper-validator-route-contract-tdd-seeding`

## Risk Controls

- No `.env*` access, output, summary, or modification.
- No product source implementation in this seeding task.
- No real row data, private data, public identifier lists, provider payloads, raw prompts, raw answers, secrets, tokens, Authorization headers, or DB URLs in evidence.
- The future pending task must prove API/UI-facing DTO redaction before any route/runtime wiring task is seeded.
