# Task Plan: Advanced Organization Analytics Route Runtime Boundary Readonly Audit

## Task

- Task id: `advanced-organization-analytics-route-runtime-boundary-readonly-audit`
- Branch: `codex/organization-analytics-route-runtime-boundary-audit`
- Baseline: `master == origin/master == cfe4e901f41137906b233d241a57aabaed720f43`
- User approval: current 2026-06-16 Codex thread says `批准执行`.

## Read Scope

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/*.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `src/app/api/v1/organization-trainings/[publicId]/publish/route.ts`
- `src/app/api/v1/organizations/route.ts`
- `src/app/api/v1/organizations/[publicId]/route.ts`
- `src/server/services/organization-analytics-service.ts`
- `src/server/services/organization-analytics-service.test.ts`
- `src/server/repositories/organization-analytics-repository.ts`
- `src/server/repositories/organization-analytics-repository.test.ts`
- `src/server/contracts/organization-analytics-contract.ts`
- `src/server/models/organization-analytics.ts`
- `docs/05-execution-logs/evidence/2026-06-16-advanced-organization-analytics-repository-service-wiring-readonly-recheck.md`
- `docs/05-execution-logs/audits-reviews/2026-06-16-advanced-organization-analytics-repository-service-wiring-readonly-recheck.md`

## Execution Plan

1. Confirm whether an organization analytics REST route currently exists.
2. Compare nearby organization route patterns against ADR-002 thin-adapter rules without modifying routes.
3. Confirm whether service/repository contracts are sufficient for route/runtime wiring or whether mapper/validator boundaries should be planned first.
4. Confirm UI-facing boundary risks around technical identifier arrays, summary/aggregate redaction, and export-readiness metadata.
5. Write evidence and audit review only; do not seed implementation unless the readonly audit concludes a separate docs/state seeding task is required.

## Blocked Gates

- No `.env*` read, output, summary, or edit.
- No implementation, route/runtime/mapper/validator/UI changes, direct DB access, row/private data exposure, schema/migration, provider/model call, dependency change, e2e/browser/dev-server, staging/prod/cloud/deploy/payment/external-service, PR, force push, or Cost Calibration Gate work.

## Validation Commands

- `npm.cmd run test:unit -- "src/server/services/organization-analytics-service.test.ts"`
- `npm.cmd run test:unit -- "src/server/repositories/organization-analytics-repository.test.ts"`
- `git diff --check`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId advanced-organization-analytics-route-runtime-boundary-readonly-audit`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId advanced-organization-analytics-route-runtime-boundary-readonly-audit`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId advanced-organization-analytics-route-runtime-boundary-readonly-audit`
