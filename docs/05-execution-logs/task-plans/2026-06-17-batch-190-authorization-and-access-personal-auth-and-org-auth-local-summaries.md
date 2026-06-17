# Batch 190 Personal Auth And Org Auth Local Summaries Plan

## Scope

- Task: `batch-190-authorization-and-access-personal-auth-and-org-auth-local-summaries`
- Target closure: `personal_auth` and `org_auth` local summaries.
- Execution profile: `local_unit_tdd`
- Allowed code surfaces: `src/server/models/**`, `src/server/contracts/**`, `src/server/validators/**`, `src/server/services/**`.
- Blocked surfaces: `.env*`, package and lock files, `src/db/schema/**`, `drizzle/**`, provider/model calls, staging/prod/cloud/deploy/payment/external-service, PR, force push, and Cost Calibration Gate.

## Read Standards

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/state/execution-profiles.yaml`
- `docs/04-agent-system/state/mechanism-source-of-truth-index.yaml`
- `docs/05-execution-logs/evidence/batch-116-authorization-and-access-personal-auth-and-org-auth-local-summaries.md`

## Local Reality

Batch 116 already added owner, quota owner, and effective edition details to `authorization-source-type-summary`. Batch 190 will avoid duplicating that work and add a narrow top-level status marker to make the aggregate summary boundary explicit.

## TDD Plan

1. RED: require `sourceSummaryStatus: "personal_org_summary"` in `authorization-source-type-summary-service.test.ts`.
2. GREEN: add the minimal model/contract/service mapping for the status marker.
3. Keep redaction behavior unchanged and do not change authorization enforcement.

## Validation Commands

- `npm.cmd run test:unit -- src/server/services/authorization-source-type-summary-service.test.ts`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ImplementationAutoSeedReadiness.ps1 -TaskId phase-69-advanced-authorization-context-implementation-planning -CandidateTaskId batch-190-authorization-and-access-personal-auth-and-org-auth-local-summaries`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId batch-190-authorization-and-access-personal-auth-and-org-auth-local-summaries`
