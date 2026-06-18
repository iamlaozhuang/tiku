# Organization Training Version Takedown Runtime Route Contract TDD Plan

## Scope

- taskId: `organization-training-version-takedown-runtime-route-contract-tdd`
- executionProfile: `local_unit_tdd`
- target use case: `UC-ADV-ORG-TRAINING-CONTENT-LIFECYCLE`
- goal: close the no-schema organization-training version takedown runtime route/repository/API contract gap.

## Read Standards

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/*.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/state/execution-profiles.yaml`
- `docs/04-agent-system/state/local-experience-coverage-matrix.yaml`
- `docs/05-execution-logs/evidence/2026-06-17-organization-training-runtime-api-gap-boundary-audit.md`

## Implementation Plan

1. Add failing route and repository tests for version takedown runtime exposure.
2. Verify RED with focused unit tests before production-code changes.
3. Wire `takeDownVersion` into the runtime store and route handler using the existing validator and service command.
4. Add a thin App Router entrypoint at `/api/v1/organization-trainings/[publicId]/take-down`.
5. Add repository takedown persistence using existing `organization_training_version` lifecycle fields only.
6. Update docs/state/evidence/audit without claiming `experience_closed`.

## Allowed Files

- `src/app/api/v1/organization-trainings/[publicId]/take-down/route.ts`
- `src/server/services/organization-training-route.ts`
- `src/server/services/organization-training-route.test.ts`
- `src/server/repositories/organization-training-repository.ts`
- `src/server/repositories/organization-training-repository.test.ts`
- `docs/04-agent-system/state/local-experience-coverage-matrix.yaml`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-06-17-organization-training-version-takedown-runtime-route-contract-tdd.md`
- `docs/05-execution-logs/evidence/2026-06-17-organization-training-version-takedown-runtime-route-contract-tdd.md`
- `docs/05-execution-logs/audits-reviews/2026-06-17-organization-training-version-takedown-runtime-route-contract-tdd.md`

## Blocked Gates

- `.env*`, secrets, tokens, cookies, Authorization headers, DB URLs
- provider/model calls, provider payloads, raw prompt/raw answer
- schema/drizzle/migration changes
- package/lockfile/dependency changes
- dev server, Browser/Playwright runtime, full e2e
- staging/prod/cloud/deploy/payment/external-service
- PR, force push, Cost Calibration Gate
- public identifier inventories, row data, private data

## Validation Plan

- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-TikuProjectStatus.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-TikuNextAction.ps1 -VerboseHistory`
- RED then GREEN: `npm.cmd run test:unit -- src/server/services/organization-training-route.test.ts src/server/repositories/organization-training-repository.test.ts`
- `npm.cmd run test:e2e -- --list`
- `npx.cmd prettier --check --ignore-unknown src/app/api/v1/organization-trainings/[publicId]/take-down/route.ts src/server/services/organization-training-route.ts src/server/services/organization-training-route.test.ts src/server/repositories/organization-training-repository.ts src/server/repositories/organization-training-repository.test.ts docs/04-agent-system/state/local-experience-coverage-matrix.yaml docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-17-organization-training-version-takedown-runtime-route-contract-tdd.md docs/05-execution-logs/evidence/2026-06-17-organization-training-version-takedown-runtime-route-contract-tdd.md docs/05-execution-logs/audits-reviews/2026-06-17-organization-training-version-takedown-runtime-route-contract-tdd.md`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId organization-training-version-takedown-runtime-route-contract-tdd`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId organization-training-version-takedown-runtime-route-contract-tdd`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId organization-training-version-takedown-runtime-route-contract-tdd`

## Risk Controls

- Use existing service takedown logic; do not change lifecycle semantics.
- Use existing `organization_training_version` columns only; no schema work.
- Do not store or expose internal numeric IDs in API payloads.
- Evidence records commands, results, and boundaries only.
