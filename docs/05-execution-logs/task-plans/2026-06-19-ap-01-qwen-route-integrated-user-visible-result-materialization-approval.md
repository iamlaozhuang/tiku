# AP-01 Qwen Route-Integrated User-Visible Result Materialization Approval Task Plan

taskId: ap-01-qwen-route-integrated-user-visible-result-materialization-approval
status: in_progress

## Scope

- Create a docs-only approval package for route-integrated Qwen output materialization.
- Define whether provider output may become user-visible or persisted.
- Define redaction, `personal_ai_generation_result` write policy, request limits, rollback, and stop conditions.
- Keep provider/model calls, `.env.local` reads, extra provider calls, Cost Calibration Gate, staging/prod/deploy, source
  changes, tests, schema, migrations, scripts, dependencies, package files, lockfiles, PR, push, and force push blocked.

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
- `docs/04-agent-system/state/local-experience-coverage-matrix.yaml`
- `docs/05-execution-logs/evidence/2026-06-19-ap-01-qwen-route-integrated-provider-one-request-execution.md`
- Existing result materialization surfaces:
  - `src/db/schema/ai-rag.ts`
  - `src/server/models/personal-ai-generation-result.ts`
  - `src/server/validators/personal-ai-generation-result-persistence.ts`
  - `src/server/repositories/personal-ai-generation-result-repository.ts`
  - `src/server/services/personal-ai-generation-result-persistence-service.ts`
  - `src/server/services/personal-ai-generation-result-history-service.ts`
  - `src/server/services/personal-ai-generation-result-route.ts`

## Approval Questions

- Is provider output allowed to become user-visible?
- Is provider output allowed to be persisted?
- Should the implementation write `personal_ai_generation_result`?
- What redaction boundary applies to content, evidence, audit, and route responses?
- What request limits and stop conditions apply to the next implementation and any later real request?
- What rollback approach applies if materialization is wrong or redaction fails?

## Validation Commands

- `npx.cmd prettier --write --ignore-unknown <changed docs/state files>`
- `npx.cmd prettier --check --ignore-unknown <changed docs/state files>`
- `git diff --check`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId ap-01-qwen-route-integrated-user-visible-result-materialization-approval`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId ap-01-qwen-route-integrated-user-visible-result-materialization-approval`

## Blocked Gates

- Provider/model call
- `.env.local` read
- Extra provider call
- Provider retry
- Streaming
- Cost Calibration Gate
- Staging/prod/cloud/deploy
- Payment/external service
- Source/test/e2e/script changes
- Schema/migration changes
- Dependency/package/lockfile changes
- PR, push, and force push

Cost Calibration Gate remains blocked.
